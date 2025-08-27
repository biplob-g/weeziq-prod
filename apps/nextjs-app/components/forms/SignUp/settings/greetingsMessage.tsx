import Section from '@/components/SectionLabel'
import React from 'react'
import { FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form'
import FormGenerator from '../formGenerator'

type Props = {
    message: string
    register: UseFormRegister<FieldValues>
    errors: FieldErrors<FieldValues>
}

const greetingsMessage = ({message, register, errors}: Props) => {
  return (
    <div className='flex flex-col gap-2'>
<Section
label='Greeting message'
message='Customize your welcome message'
/>
<div className='lg:w-[500px]'>
<FormGenerator
placeholder={message}
inputType="textarea"
lines={2}
register={register}
errors={errors}
name="welcomeMessage"
type="text"
/>
</div>
    </div>
  )
}

export default greetingsMessage