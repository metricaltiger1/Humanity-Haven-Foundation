# Humanity’s Haven Foundation Security Specification

## Data Invariants
- A blog post must have a title, content, and a creation date.
- An event must have a title, date, and status.
- A product must have a name, price, and image.
- A contact message must have a sender's name, email, and message.
- Only admins can perform write operations on posts, events, and products.
- Anyone can read posts, events, and products.
- Anyone can create contact messages, but only admins can read or update them.

## The "Dirty Dozen" Payloads (Denial Tests)
1. **Unauthorized Post Creation**: Trying to create a blog post as a non-admin.
2. **Post Modification**: Trying to edit a blog post's content as a non-admin.
3. **Invalid Post Schema**: Sending a post with a 2MB title.
4. **ID Poisoning**: Creating a message with a 1KB document ID.
5. **PII Leakage**: Trying to read all contact messages as a public user.
6. **Message Tampering**: Trying to change the status of a message from 'unread' to 'read' as a public user.
7. **Product Price Injection**: Setting a product price to a negative number or a string.
8. **Event Date Simulation**: Creating an event with a client-side timestamp instead of server timestamp for `createdAt`.
9. **Shadow Admin**: Trying to write to the `admins` collection directly.
10. **Product Deletion**: A non-admin trying to delete foundation merchandise.
11. **Event State Skip**: Trying to set an event status to an unsupported string.
12. **Recursive Message Attack**: Flooding the system with messages exceeding field size limits.

## The Test Plan
The `firestore.rules` will be tested using individual unit tests for each collection, ensuring that `request.auth.uid` is checked against a trusted `admins` collection for elevated privileges.
