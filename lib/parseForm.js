// import formidable from 'formidable';
// import { Readable } from 'stream';

// export function parseFormData(req) {
//   const form = formidable({
//     keepExtensions: true,
//     multiples: false,
//   });

//   return new Promise((resolve, reject) => {
//     const stream = Readable.fromWeb(req.body);

//     form.parse(
//       {
//         headers: Object.fromEntries(req.headers),
//         body: stream,
//       },
//       (err, fields, files) => {
//         if (err) reject(err);
//         resolve({ fields, files });
//       }
//     );
//   });
// }
