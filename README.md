# fundbit

> Crowdfund reverse-bounties for open-source issues

## Getting Started

First, run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## MVP-ready

- [x] Set up DB
- [x] Record all Stripe products in DB, mapping to org/repo/issue composite key
- [ ] Set up auto-return functionality
  - [x] Record checkout session in DB with metadata
  - [x] Set up webhook to listen for successful payment
  - [ ] **Create cron job to check for expired bounties and automate returns**
  - [ ] Write some tests
- [ ] Add a way to "pause refunds" (e.g. when a claim has been made, but not yet verified)
- [ ] Style everything to look more legit
- [x] Show the total bounty on an issue
- [x] Create a payment graph showing the payout over time for each issue
- [ ] Add warning about low-value payments (e.g. $1 payments will get eaten by fees)
- [ ] Add a page for repo owners to claim bounties
- [ ] **Add a cron job to check for closed issues and automatically pause bounties**
- [ ] Integrate a bot that auto comments on issues when bounties are created
- [ ] Have the bot auto-update the bounty amount in the issue comment when it changes
- [ ] Success UI for when a payment goes through (Sonner?)
- [ ] Error UI for when a payment fails (Sonner?)
- [ ] Figure out why Shadcn is being painful
- [ ] Write terms and conditions

### Future Features

- [ ] Email notifications for bounty status changes
- [ ] Multi-currency support for global contributions
- [ ] User profiles for tracking contributions and refunds
- [ ] Social sharing options to promote bounties
- [ ] Automated bounty release approval based on paying donor approval
