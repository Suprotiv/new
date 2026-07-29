require('dotenv').config();

const dataStore = require('../dataStore');

async function main() {
  const members = await dataStore.getTeamMembers();

  for (const member of members) {
    await dataStore.updateTeamMember(member.id, {
      ...member,
      normalImage: member.normalImage || '',
      hoverImage: member.hoverImage || '',
    });
  }

  console.log(`Mapped ${members.length} existing team images to hover images.`);
}

main().catch(error => {
  console.error('Failed to map existing team images:', error);
  process.exit(1);
});
