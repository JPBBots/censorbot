import { motion, MotionProps } from 'framer-motion'
import {
  Box,
  BoxProps,
  Button,
  ButtonProps,
  Flex,
  FlexProps,
  Stack,
  StackProps,
  Image,
  ImageProps
} from '@chakra-ui/react'
import { HStack, VStack } from '@chakra-ui/layout'

export const MotionBox = motion<
  Omit<BoxProps, keyof MotionProps> & MotionProps
>(Box as any)
export const MotionFlex = motion<
  Omit<FlexProps, keyof MotionProps> & MotionProps
>(Flex as any)
export const MotionStack = motion<
  Omit<StackProps, keyof MotionProps> & MotionProps
>(Stack as any)
export const MotionVStack = motion<
  Omit<StackProps, keyof MotionProps> & MotionProps
>(VStack as any)
export const MotionHStack = motion<
  Omit<StackProps, keyof MotionProps> & MotionProps
>(HStack as any)
export const MotionButton = motion<
  Omit<ButtonProps, keyof MotionProps> & MotionProps
>(Button as any)
export const MotionImage = motion<
  Omit<ImageProps, keyof MotionProps> & MotionProps
>(Image as any)
