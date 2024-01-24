import { Client } from '@hubspot/api-client'
import { PublicOwner } from '@hubspot/api-client/lib/codegen/crm/owners/models/all'
 
const HUB_SPOT_TOKEN = process.env.HUBSPOT_TOKEN

class HubSpotClient {
  private client: Client

  constructor() {
    this.client = new Client({ accessToken: HUB_SPOT_TOKEN },)
  }

  getClient(): Client {
    return this.client
  }
  async getOwnerId(ownerEmailAdd: string) {
    try {
      const ownerIdResponse = await this.client.crm.owners.ownersApi.getPage(ownerEmailAdd)
      const owners: PublicOwner[] = ownerIdResponse.results
      if (owners.length > 0) {
        const firstOwnerId: string | undefined = owners[0].id
        if (firstOwnerId) {
          console.log(`id of the owner: ${firstOwnerId}`)
          return firstOwnerId
        } else {
          console.log('id not found for the owner.')
        }
      } else {
        console.log('No owners found for the provided email.')
      }
    } catch (e) {
      console.log('an error ocurred', e)
    }
  }
  async createContact(properties: any): Promise<any> {
    try {
      const response = await this.client.crm.contacts.basicApi.create(properties)
    } catch (error) {
      console.error('Error fetching contacts from HubSpot:', error)
      throw error
    }
  }
}

export default new HubSpotClient()
