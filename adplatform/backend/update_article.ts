import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: 'postgresql://postgres.hobmhiaouplaoxzzcrgv:Krav20%23pool@aws-0-eu-central-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

const newContent = `High Chief Dr. Pastra Arinze Etie, Group Managing Director of Bems Group and Ochiagha Nneato Ancient Kingdom, on Saturday joined other distinguished stakeholders from Abia North under the Alliance for Good Governance at a strategic meeting in Ugwueke, Bende Local Government Area of Abia State.

The gathering, held at the Isieke Civic Centre, Ugwueke, on September 26, 2026, brought together prominent sons and daughters of Abia North to deliberate on governance and the need to sustain what members described as the gains recorded under the administration of Governor Alex Otti.

![Event Gathering](/uploads/news/pastra-1.jpg)

High Chief Etie was among the notable stakeholders who participated in the meeting, which marked the second major gathering of the Alliance following its inaugural meeting in Abiriba.

The Alliance, made up of traditional leaders, business personalities, professionals and other opinion leaders from Abia North, used the occasion to reaffirm its commitment to promoting continuity in governance and ensuring that policies and programmes introduced by the present administration are sustained beyond 2031.

Presenting the communique of the meeting, the Alliance’s Secretary and Spokesperson, Prof. Mkpa Agu Mkpa, said members considered the current administration an example of governance that should be sustained.

He also announced resolutions on voter education and grassroots mobilisation ahead of the 2027 general elections.

Speaking on the role of the younger generation, High Chief Etie stressed the importance of preserving the values and standards of leadership established by the elders.

He expressed confidence that Abia North and the wider Abia State would continue to uphold what he described as the high standards of leadership demonstrated by Governor Otti.

![Speaker](/uploads/news/pastra-2.jpg)

The meeting also featured contributions from other prominent stakeholders, including former Minister of State for Mines and Steel Development, Dr. Uche Ogah; former Group Managing Director of FBN Holdings, Elder Urum Kalu Eke; and the host, Sir Johnson Chukwu.

![Stakeholders at Table](/uploads/news/pastra-3.jpg)

The initiator and convener of the Alliance, Chief Ebueme Ezikpe, said the group was neither a political party nor an association of government contractors, but a platform through which opinion leaders could contribute to discussions on governance and the future of Abia State.

The meeting was attended by members of the Ugwueke Council of Traditional Rulers and other leaders from across Abia North, including stakeholders who travelled from outside the country to participate.`;

const titleSearch = "High Chief Pastra Etie Joins Abia North Stakeholders to Back Good Governance";

async function run() {
  try {
    const res = await pool.query(
      `UPDATE blog_posts 
       SET content = $1, 
           author_name = 'Studio Arella',
           image_url = '/uploads/news/pastra-1.jpg',
           reading_time_minutes = 5
       WHERE title = $2`,
      [newContent, titleSearch]
    );
    console.log(`Updated ${res.rowCount} row(s).`);
  } catch (err) {
    console.error('Error updating:', err);
  } finally {
    pool.end();
  }
}

run();
