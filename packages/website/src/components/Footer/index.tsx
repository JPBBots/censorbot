import { GenericFooter } from './GenericFooter'

export function Footer() {
  return (
    <GenericFooter
      name="Censor Bot"
      companyName="JPBBots"
      copyrightYear="2017-2022"
      links={[
        {
          label: 'Contact Us',
          children: [
            {
              label: 'Discord Server',
              url: '/support'
            },
            {
              label: 'support@jpbbots.org',
              url: 'mailto:support@jpbbots.org'
            },
            {
              label: 'Review',
              url: '/review'
            }
          ]
        },
        {
          label: 'Censor Bot',
          children: [
            {
              label: 'Invite',
              url: '/invite'
            },
            {
              label: 'Vote',
              url: '/vote'
            },
            {
              label: 'Status',
              url: '/status'
            }
          ]
        },
        {
          label: 'Important Links',
          children: [
            {
              label: 'Privacy Policy',
              url: '/privacy'
            },
            {
              label: 'Terms of Service',
              url: '/terms'
            },
            {
              label: 'Discord ToS',
              url: 'https://discord.com/terms'
            }
          ]
        }
      ]}
    />
  )
}
