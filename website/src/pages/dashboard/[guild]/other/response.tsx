import { Formik } from 'formik'
import React from 'react'

import { Section } from '@jpbbots/censorbot-components'
import { FormControl, VStack, Input, Button, Divider, Text } from '@chakra-ui/react'

import { Option } from '~/functional/Option'

import { SettingSection } from '~/settings/SettingSection'

export default function Response () {
  return (
    <SettingSection section="Response">
      {
        ({ db }, _, handleFormikSubmit) => (<>
          <Text textAlign="left">Message that appears after a filter is triggered</Text>
          <Divider color="lighter.5" />
          <Formik initialValues={{
            msg: {
              content: db.msg.content,
              deleteAfter: db.msg.deleteAfter,
              dm: db.msg.dm
            }
          }} onSubmit={handleFormikSubmit}>
            {({
              handleSubmit,
              getFieldHelpers,
              handleChange
            }) =>
              db.msg.content === false
                ? <>
                  <Button onClick={() => {
                    getFieldHelpers('msg.content').setValue('You\'re not allowed to say that!')
                    handleSubmit()
                  }}>Enable</Button>
                </>
                : <FormControl w="full" onChange={handleSubmit as any}>
                    <VStack spacing="sm">
                      <Button onClick={() => {
                        getFieldHelpers('msg.content').setValue(false)
                        handleSubmit()
                      }}>Disable</Button>
                      <Section title="Message Content" description="What the message will say">
                        <Input name="msg.content" value={db.msg.content ?? 'You\'re not allowed to say that!'} onChange={handleChange} />
                      </Section>
                      <Section title="Delete After" description="Time in seconds it will take until the response is automatically deleted">
                        {
                          db.msg.deleteAfter
                            ? <>
                              {/* <NumberInput>
                                <NumberInputField name="msg.deleteAfter" value={db.msg.deleteAfter} onChange={handleChange} />
                                <NumberInputStepper>
                                  <NumberIncrementStepper />
                                  <NumberDecrementStepper />
                                </NumberInputStepper>
                              </NumberInput> */}
                              <Input name="msg.deleteAfter" type="number" value={db.msg.deleteAfter / 1000} onChange={({ target }) => {
                                getFieldHelpers('msg.deleteAfter').setValue(Number(target.value) * 1000)
                                handleSubmit()
                              }} />
                              <Button onClick={() => {
                                getFieldHelpers('msg.deleteAfter').setValue(false)
                                handleSubmit()
                              }}>Never</Button>
                            </>
                            : <>
                              <Button onClick={() => {
                                getFieldHelpers('msg.deleteAfter').setValue(3000)
                                handleSubmit()
                              }}>Enable</Button>
                            </>
                        }
                      </Section>
                      <Section title="Direct Message">
                        <Option name="msg.dm" isChecked={db.msg.dm} onChange={handleChange} label="Send response to triggering user’s Direct Messages" isPremium />
                      </Section>
                    </VStack>
                  </FormControl>
            }
          </Formik>
        </>)
      }
    </SettingSection>
  )
}
