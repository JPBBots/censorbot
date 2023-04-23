import { Link, LinkProps } from '@chakra-ui/layout'
import { Button, ButtonProps } from '@chakra-ui/button'

import NextLink, { LinkProps as NextLinkProps } from 'next/link'

export function PageLink(props: Omit<LinkProps, 'href'> & NextLinkProps) {
  return <Link {...props} href={props.href as string} as={NextLink} />
}

export function PageButton(props: Omit<ButtonProps, 'href'> & NextLinkProps) {
  return <Button {...props} as={NextLink} />
}
