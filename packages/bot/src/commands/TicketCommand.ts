import { Embed, MessageBuilder } from '@jadl/builders'
import { Author, Command, Options, Run, Worker } from '@jadl/cmd'
import { MessageFlags } from 'discord-api-types/v10'
import { APIUser } from 'discord-api-types/v9'
import { WorkerManager } from '../managers/Worker'

@Command('ticket', 'Sends a ticket for words that should be uncensored.')
export class TicketCommand {
  @Run()
  async run(
    @Options.String('word', "The word or phrase that shouldn't be censored", {
      required: true
    })
    word: string,
    @Author() author: APIUser,
    @Worker() worker: WorkerManager
  ) {
    const id = await worker.tickets.create(word, author.id)

    if (!id) return

    return new MessageBuilder()
      .setMessage({ flags: MessageFlags.Ephemeral })
      .addEmbed(
        new Embed()
          .title(`Ticket submitted (${id})`)
          .description(
            "We'll get back to you soon on our decision! Hang tight."
          )
          .footer(`${author.username}#${author.discriminator}`)
      )
  }
}
