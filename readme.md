# Luke Email-Address Library

Simple E-Mail address class / parser, which I can share across projects.

# Usage

```ts
import { EmailAddress } from 'llibemailaddress';

const address1 = new EmailAddress(
  'luke.rieff', /* Username */
  'gmail.com', /* Hostname */
  'Luke Rieff' /* Name */
);
const address2 = EmailAddress.fromAddress('luke.rief@gmail.com', 'Luke Rieff');
const address3 = EmailAddress.decode('"Luke Rieff" <luke.rieff@gmail.com>');

console.log(address1.encode());
/* Luke Rieff <luke.rieff@gmail.com> */
console.log(address2.address)
/* luke.rieff@gmail.com */

```