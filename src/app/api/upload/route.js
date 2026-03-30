import { NextResponse } from 'next/server';
import { simpleParser } from 'mailparser';
import Mbox from 'node-mbox';
import { Readable } from 'stream';

const matchJobState = (text, subject) => {
  const t = (text + ' ' + subject).toLowerCase();
  
  if (t.includes('offer') || t.includes('teklif') || t.includes('congratulations') || t.includes('tebrikler')) return 'Offer';
  if (t.includes('interview') || t.includes('mülakat') || t.includes('görüşme') || t.includes('değerlendirme')) return 'Interview';
  if (t.includes('unfortunately') || t.includes('not moving forward') || t.includes('olumsuz') || t.includes('rejected') || t.includes('başka aday') || t.includes('reddedildi')) return 'Rejected';
  if (t.includes('application') || t.includes('başvuru') || t.includes('applied') || t.includes('aldık') || t.includes('received')) return 'Applied';
  
  return null;
}

const matchDeadline = (text) => {
  const dateRegex = /(?:deadline|son tarih|until|by)[\s\S]{0,30}?(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})/i;
  const match = text.match(dateRegex);
  return match ? match[1] : null;
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('mbox');
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const nodeStream = Readable.fromWeb(file.stream());
    const mbox = new Mbox(nodeStream);

    const applications = [];
    const parsePromises = [];

    return new Promise((resolve, reject) => {
      mbox.on('message', function(msg) {
        const p = simpleParser(msg).then(parsed => {
           const state = matchJobState(parsed.text || '', parsed.subject || '');
           if (state) {
             const fromText = parsed.from?.text || '';
             const companyMatch = fromText.match(/@([\w\-]+)\./);
             const company = companyMatch ? companyMatch[1] : fromText.split('@')[1] || 'Unknown';
             
             // filter out generic or internal
             if (company === 'gmail' || company === 'yahoo') return;

             const deadline = matchDeadline(parsed.text || '');
             applications.push({
               id: parsed.messageId || Math.random().toString(),
               company: company.charAt(0).toUpperCase() + company.slice(1),
               subject: parsed.subject,
               date: parsed.date,
               state,
               deadline
             });
           }
        }).catch(err => console.error('Error parsing email', err));
        
        parsePromises.push(p);
      });

      mbox.on('end', async () => {
         await Promise.all(parsePromises);
         // Deduplicate sometimes if same exact subject/company
         resolve(NextResponse.json({ success: true, applications }));
      });

      mbox.on('error', (err) => {
         reject(NextResponse.json({ error: err.message }, { status: 500 }));
      });
    });
  } catch(e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
