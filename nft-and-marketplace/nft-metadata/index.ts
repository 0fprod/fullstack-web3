import { Metadata, metadataBuilder } from '../utils/metadata';
/**
 * IPFS Urls for jsons
'ipfs://QmPpew49diwW6hLhPXiWsWLwxSRJJBp8KRp6A1eYucvLDp', // Junior
'ipfs://bafybeieefb7gwrxc5ijq3mf6bm6odkwcdgvbjrfalssije7ow4okf4q2g4/', // Medior
'ipfs://QmVkZEJkeZ4PxQwCmAp1NZkkBiKwNvmDVHJ3odBTmxCe2H', // Senior
*/

const senior: Metadata = metadataBuilder({
  name: 'Senior',
  description: 'loremImpsum.randomize(93,"words")',
  image: 'ipfs://bafybeicbewerrelcp6raus6of4mdibyj3jbx7fyvtd7jl375srlyuwc2vm/',
  attributes: [
    { skill: 'coffee-addiction', level: 98 },
    { skill: 'javascript', level: 100 },
  ],
});

const medior: Metadata = metadataBuilder({
  name: 'Medior',
  description: 'Hello this is a description',
  image: 'ipfs://bafybeiba2jfdfts7in6vntvtu4lonyclcoziiscqrgfinorgyctiigzwju/',
  attributes: [
    { skill: 'coffee-addiction', level: 38 },
    { skill: 'alcohol-immune', level: 100 },
  ],
});

const junior: Metadata = metadataBuilder({
  name: 'Junior',
  description:
    'Im a highly motivated and talented engineer with a strong passion for problem-solving and technology. I have a Bachelors degree in Engineering and has completed several internships at reputable companies, gaining valuable hands-on experience in the field. Im now seeking a full-time position at a company where she can continue to grow and learn as an engineer, while also making a positive impact on the team and organization.',
  image: 'ipfs://QmUdwF2Lxg5gFPMMshfBEdmFcydSaJkBpPLitJJjXKWH3j',
  attributes: [
    { skill: 'typescript', level: 198 },
    { skill: 'javascript', level: 200 },
    { skill: 'fullstack', level: 38 },
    { skill: 'photoshop', level: 500 },
    { skill: 'coffee-addiction', level: 1 },
  ],
});
