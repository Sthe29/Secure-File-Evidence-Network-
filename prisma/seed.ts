import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();
const demoPassword = 'DocketSecure2026!';

const users = [
  { email: 'thandi.molefe@example.com', nationalId: '9001015009087', personnelNumber: null, fullName: 'Thandi Molefe', rank: null, station: 'SAPS Berea Police Station', division: 'Public Portal', phoneNumber: '+27 82 555 0101', role: UserRole.COMPLAINANT },
  { email: 's.ndlovu@police.sfen.gov', personnelNumber: 'POL-10824', fullName: 'Sarah Ndlovu', rank: 'Constable', station: 'SAPS Berea Police Station', division: 'Community Service Centre', phoneNumber: '+27 11 884 1000', role: UserRole.CSC_OFFICER },
  { email: 'd.khumalo@cid.sfen.gov', personnelNumber: 'POL-20491', fullName: 'David Khumalo', rank: 'Detective Inspector', station: 'SAPS Berea Police Station', division: 'Commercial Crime Section', phoneNumber: '+27 11 884 1004', role: UserRole.DETECTIVE },
  { email: 'e.vance@command.sfen.gov', personnelNumber: 'POL-30912', fullName: 'Elena Vance', rank: 'Senior Superintendent', station: 'SAPS Berea Police Station', division: 'Station Command', phoneNumber: '+27 11 884 1005', role: UserRole.COMMANDER },
  { email: 'm.cole@admin.sfen.gov', personnelNumber: 'POL-40199', fullName: 'Marcus Cole', rank: 'Chief ICT Security Officer', station: 'National Police Directorate', division: 'System Administration', phoneNumber: '+27 11 884 1006', role: UserRole.ADMINISTRATOR },
];

async function main() {
  const passwordHash = await bcrypt.hash(demoPassword, 12);
  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { ...user, passwordHash },
      create: { ...user, passwordHash },
    });
  }
  console.log(`Seeded ${users.length} SFEN demo users.`);
}

main()
  .catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
