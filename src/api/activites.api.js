import { api } from './client.js'


export function getActivites() {
  return api('/activites')
}