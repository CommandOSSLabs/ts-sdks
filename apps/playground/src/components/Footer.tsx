import Image from 'next/image'
import { Button } from './ui/button'

const links = [
  {
    title: 'Site Builder SDK docs',
    link: 'https://sdk.mystenlabs.com/walrus'
  },
  {
    title: 'Walrus Website',
    link: 'https://walrus.xyz'
  },
  {
    title: 'Whitepaper',
    link: 'https://github.com/MystenLabs/walrus-docs/blob/main/docs/walrus.pdf'
  },
  {
    title: 'Explorer',
    link: 'https://walruscan.com/testnet/home'
  },
  {
    title: 'Media Kit',
    link: 'https://drive.google.com/drive/folders/1AoWZPWhrjSSNhpVLjVjuf7J3pA2imheq'
  },
  {
    title: 'Walrus SDK docs',
    link: 'https://sdk.mystenlabs.com/walrus'
  }
]

const socials = [
  {
    icon: '/icons/x.svg',
    link: 'https://x.com/WalrusProtocol'
  },
  {
    icon: 'icons/discord-lg.svg',
    link: 'https://discord.gg/walrusprotocol'
  },
  {
    icon: '/icons/github-lg.svg',
    link: 'https:/github.com/MystenLabs/walrus-docs'
  }
]

export default function Footer() {
  return (
    <div className="flex flex-col xl:flex-row gap-4">
      {/* Links */}
      <div className="bg-[#0C0F1D] xl:flex-1 rounded-2xl grid grid-cols-2 text-[##F7F7F7] py-10 px-10 gap-10 font-montreal">
        {links.map(link => (
          <a
            key={link.title}
            href={link.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="text-lg text-center md:text-left hover:underline hover:text-[#97F0E5] hover:cursor-pointer">
              {link.title}
            </span>
          </a>
        ))}
      </div>

      {/* Socials */}
      <div className="xl:flex-1 grid grid-cols-3 border-2 border-[#0C0F1D] bg-[#0C0F1D] gap-[2px] rounded-3xl overflow-clip">
        {socials.map(social => (
          <a
            key={social.link}
            href={social.link}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white h-24 xl:h-full flex items-center justify-center rounded-none hover:cursor-pointer hover:bg-gray-200"
          >
            <Button className="bg-white hover:bg-gray-200/60 h-24 xl:h-full w-full flex items-center justify-center rounded-none">
              <Image
                alt="social"
                className="w-8 h-8 sm:w-12 sm:h-12"
                src={social.icon}
                width={32}
                height={32}
              />
            </Button>
          </a>
        ))}
      </div>
    </div>
  )
}
