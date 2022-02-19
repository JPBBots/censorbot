import { useGuild } from '@/hooks/useGuilds'
import { IOption, ISetting, OptionType, settings } from './settings'
import NextLink from 'next/link'
import { Option } from '~/Option'

import { PermissionUtils, humanReadablePermissions } from '@/utils/Permissions'

import {
  Button,
  Icon,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputStepper,
  Textarea,
  Text,
  VStack,
  HStack,
  Select,
  Alert,
  AlertIcon
} from '@chakra-ui/react'
import Pieces from 'utils/Pieces'
import {
  Exception,
  ExceptionType,
  GuildData,
  PunishmentLevel,
  PunishmentType
} from '@jpbbots/cb-typings'
import { SectionName } from './Aside'

import TextareaResizer from 'react-textarea-autosize'
import { Tags } from './Tags'
import { ExceptionSetting } from './ExceptionSetting'
import { FaPlus } from 'react-icons/fa'

import { useRouter } from 'next/router'
import { PunishmentSetting } from './PunishmentSetting'
import { TimeSelector } from '~/functional/TimeSelector'
import { SettingSection } from '~/Dashboard'

export function SettingOption({
  setValue,
  guild,
  pieces,
  disable,
  option
}: {
  option: IOption
  setValue: (value: any) => void
  guild: GuildData
  disable: () => void
  pieces: any
}) {
  const router = useRouter()

  if (!guild) return <h1>Loading</h1>

  const props = { name: option.name }

  const value = pieces[option.name]

  if (option.type === OptionType.Boolean) {
    return (
      <Option
        {...props}
        isChecked={value}
        label={option.label}
        onChange={({ target }) => {
          setValue(target.checked)
        }}
        isPremium={option.premium}
      />
    )
  }

  if (option.type === OptionType.Input) {
    const Component = option.textarea ? Textarea : Input
    return (
      <Component
        {...props}
        as={option.textarea ? TextareaResizer : undefined}
        resize="none"
        w="400px"
        maxW="80vw"
        value={value ?? option.default ?? ''}
        placeholder="None"
        onChange={({
          target
        }: {
          target: HTMLInputElement | HTMLTextAreaElement
        }) => {
          if (!option.noneDisable && target.value === '') return disable()

          setValue(target.value === '' ? null : target.value)
        }}
      />
    )
  }

  if (option.type === OptionType.Select) {
    // return <Selector
    //   {...props}
    //   onChange={(value) => {
    //     setValue(value === 'none' && option.allowNone
    //       ? null
    //       : option.number
    //         ? Number(value)
    //         : value
    //     )
    //   }}
    //   channel={option.channel}
    //   role={option.role}
    //   placeholder={option.placeholder}
    //   value={value ?? 'none'}>
    //     {[
    //       ...(option.allowNone ? [{ value: 'none', label: 'None' }] : []),
    //       ...option.options(guild)
    //     ]}
    // </Selector>
    const prefix = option.role ? '@' : option.channel ? '#' : ''
    return (
      <Select
        {...props}
        onChange={(ev) => {
          const value = ev.target.value
          setValue(
            value === 'none' && option.allowNone
              ? null
              : option.number
              ? Number(value)
              : value
          )
        }}
        w="400px"
        maxW="80vw"
        value={value ?? 'none'}
      >
        {/* {[
          ...(option.allowNone ? [{ value: 'none', label: 'None' }] : []),
          ...option.options(guild)
        ]} */}
        {option.allowNone && <option value="none">None</option>}
        {option.options?.(guild).map((x) => (
          <option key={x.value} value={x.value}>
            {prefix}
            {x.label}
          </option>
        ))}
        {option.categories?.(guild).map((x) => (
          <optgroup label={x.name}>
            {x.children.map((a) => (
              <option value={a.value}>
                {prefix}
                {a.label}
              </option>
            ))}
          </optgroup>
        ))}
      </Select>
    )
  }

  if (option.type === OptionType.Tags) {
    return (
      <VStack w="full" align="left">
        {option.premiumMaxTags &&
          option.maxTags &&
          !guild.premium &&
          value.length >= option.maxTags && (
            <NextLink
              href={{
                pathname: '/dashboard/[guild]/premium',
                query: router.query
              }}
            >
              <Alert status="warning" cursor="pointer">
                <AlertIcon />
                <Text>
                  Reached the maximum of {option.maxTags}. Get premium for more!
                </Text>
              </Alert>
            </NextLink>
          )}
        <Tags
          {...props}
          settings={{
            ...option,
            ...(option.fn?.(guild) ?? {}),
            ...(guild.premium
              ? { maxTags: option.premiumMaxTags ?? option.maxTags }
              : {})
          }}
          placeholder={option.placeholder}
          value={value}
          onChange={(val) => {
            setValue(val)
          }}
        />
      </VStack>
    )
  }

  if (option.type === OptionType.Number) {
    const multiplier = option.multiplier ?? 1

    return (
      <NumberInput w="400px" maxW="80vw">
        <Input
          {...props}
          type="number"
          value={value / multiplier}
          onChange={({ target }) => {
            setValue(Number(target.value) * multiplier)
          }}
        />
        <NumberInputStepper>
          <NumberIncrementStepper
            onClick={() => {
              setValue(Number(value) + multiplier)
            }}
          />
          <NumberDecrementStepper
            onClick={() => {
              setValue(Number(value) - multiplier)
            }}
          />
        </NumberInputStepper>
      </NumberInput>
    )
  }

  if (option.type === OptionType.BitBool) {
    return (
      <Option
        onChange={({ target }) => {
          if (target.checked) {
            setValue(value | option.bit)
          } else {
            setValue(value & ~option.bit)
          }
        }}
        {...props}
        name={`${option.name}.${option.bit}`}
        isChecked={(value & option.bit) !== 0}
        isPremium={option.premium}
        label={option.label}
      />
    )
  }

  if (option.type === OptionType.Time) {
    return (
      <TimeSelector
        value={value}
        max={option.max}
        times={option.times}
        nullIs={option.nullIs}
        nullIsFalse={option.nullIsFalse}
        onChange={(val) => {
          setValue(val)
        }}
      />
    )
  }

  if (option.type === OptionType.Exception) {
    const exceptions = value as Exception[]

    const premiumLocked = !guild.premium
      ? exceptions.length >= 5
      : exceptions.length >= 100

    return (
      <VStack w="fit-content">
        {exceptions.map((x, ind) => (
          <>
            <ExceptionSetting
              key={ind}
              guild={guild}
              exception={x}
              first={ind === 0}
              onChange={(exc) => {
                const excepts = [...exceptions]
                excepts[ind] = exc

                console.log(excepts)

                setValue(excepts)
              }}
              onDelete={() => {
                setValue(exceptions.filter((_, i) => i !== ind))
              }}
            />
          </>
        ))}
        {!premiumLocked && (
          <HStack
            cursor="pointer"
            spacing={1}
            onClick={() => {
              setValue([
                ...exceptions,
                {
                  channel: guild.guild.channels[0].id,
                  role: guild.guild.roles[0].id,
                  type: ExceptionType.Everything
                }
              ])
            }}
          >
            <Icon as={FaPlus} />
            <Text>Add Exception</Text>
          </HStack>
        )}

        {premiumLocked && (
          <NextLink
            href={{
              pathname: '/dashboard/[guild]/premium',
              query: router.query
            }}
          >
            <Alert status="warning" cursor="pointer">
              <AlertIcon />
              {!guild.premium ? (
                <Text>
                  Reached the maximum 15 punishments, get premium for more.
                </Text>
              ) : (
                'Reached the maximum 100 punishments'
              )}
            </Alert>
          </NextLink>
        )}
      </VStack>
    )
  }

  if (option.type === OptionType.Punishments) {
    const punishments = value as PunishmentLevel[]

    const premiumLocked = !guild.premium
      ? punishments.length >= 5
      : punishments.length >= 20

    const multipleOfSame = punishments.some(
      (x) => punishments.filter((b) => x.amount === b.amount).length > 1
    )

    return (
      <VStack w="full">
        {multipleOfSame && (
          <Alert status="warning">
            Warning! Multiple of the same punishment amount found. This will
            cause problems. Only one punishment with the same amount will be ran
          </Alert>
        )}
        {punishments.map((x, ind) => (
          <>
            <PunishmentSetting
              key={ind}
              guild={guild}
              punishment={x}
              onChange={(val) => {
                const punishes = [...punishments]
                punishes[ind] = val

                setValue(punishes)
              }}
              onDelete={() => {
                setValue(punishments.filter((_, i) => i !== ind))
              }}
            />
          </>
        ))}
        {!premiumLocked && (
          <HStack
            cursor="pointer"
            spacing={1}
            alignSelf="flex-start"
            onClick={() => {
              setValue([
                ...punishments,
                {
                  type: PunishmentType.Kick,
                  amount: 20,
                  time: null
                } as PunishmentLevel
              ])
            }}
          >
            <Icon as={FaPlus} />
            <Text>Add Punishment</Text>
          </HStack>
        )}
        {premiumLocked && (
          <NextLink
            href={{
              pathname: '/dashboard/[guild]/premium',
              query: router.query
            }}
          >
            <Alert status="warning" cursor="pointer">
              <AlertIcon />
              {!guild.premium ? (
                <Text>
                  Reached the maximum 5 punishments, get premium for more.
                </Text>
              ) : (
                'Reached the maximum 20 punishments'
              )}
            </Alert>
          </NextLink>
        )}
      </VStack>
    )
  }

  return <h1>Error</h1>
}

export function Setting(setting: ISetting) {
  const [guild, volatileDb, setValue] = useGuild()

  if (!guild) return null

  const pieces = Pieces.generate(volatileDb)

  const disabled =
    setting.disable &&
    pieces[setting.disable.property] === setting.disable.disableValue

  return (
    <SettingSection
      title={setting.title}
      description={setting.description}
      isPremium={setting.premium}
      tooltip={setting.tooltip}
      icon={setting.icon && <Icon as={setting.icon} />}
    >
      {setting.requiredPermission &&
        !PermissionUtils.has(
          guild.guild.permissions,
          setting.requiredPermission
        ) && (
          <Alert status="warning">
            <AlertIcon />
            <Text>
              The bot is missing the{' '}
              {humanReadablePermissions[setting.requiredPermission]}{' '}
              permissions, which is required for this setting.
            </Text>
          </Alert>
        )}
      {!disabled &&
        setting.options.map((opt, i) => (
          <SettingOption
            key={i}
            option={{
              ...opt,
              ...(guild.premium ? opt.premiumProps ?? {} : {})
            }}
            setValue={(value) => {
              setValue(opt.name, value)
            }}
            guild={guild}
            pieces={pieces}
            disable={() => {
              if (!setting.disable) return
              setValue(setting.disable.property, setting.disable.enableValue)
            }}
          />
        ))}
      {setting.disable &&
        (disabled ? (
          <Button
            onClick={() => {
              if (!setting.disable) return
              setValue(setting.disable.property, setting.disable.enableValue)
            }}
          >
            {setting.disable.enableButton ?? 'Enable'}
          </Button>
        ) : (
          <Button
            onClick={() => {
              if (!setting.disable) return
              setValue(setting.disable.property, setting.disable.disableValue)
            }}
          >
            {setting.disable.disableButton ?? 'Disable'}
          </Button>
        ))}
    </SettingSection>
  )
}

export const sectionSettings = (section: SectionName) => {
  const selected = settings.filter((x) => x.section === section)

  return (
    <>
      {selected.map((x) => (
        <Setting key={x.title ?? x.options[0].name} {...x} />
      ))}
    </>
  )
}
