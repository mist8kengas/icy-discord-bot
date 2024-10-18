import { Readable } from 'stream'
import axios from 'axios'
import xml2js from 'xml2js'
import { decode } from 'html-entities'

import { Type, type Static } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'

export async function getStream(url: string) {
  const iceStream = await axios<Readable>({
    method: 'get',
    url,
    responseType: 'stream',
    timeout: 10e3,
  }).catch(error => void console.log('Error in http response', error))
  if (!iceStream) return
  return iceStream.data
}

// xml type
export const XSPFObject = Type.Object({
  playlist: Type.Object({
    $: Type.Object({
      xmlns: Type.String({ default: 'http://xspf.org/ns/0/' }),
      version: Type.String({ default: '1' }),
    }),
    title: Type.Array(Type.String()),
    creator: Type.Array(Type.String()),
    trackList: Type.Array(
      Type.Object({
        track: Type.Array(
          Type.Object({
            title: Type.Array(Type.String()),
            annotation: Type.Array(Type.String()),
            location: Type.Array(Type.String()),
          })
        ),
      })
    ),
  }),
})
export type XSPFObjectType = Static<typeof XSPFObject>

export async function getXspfData(url: string) {
  const rawXspf = await axios<string>({ method: 'get', url })
  const rawXml = await xml2js.parseStringPromise(rawXspf.data)

  return Value.Cast(XSPFObject, rawXml)
}

export function getCurrentTitle(xspf: XSPFObjectType) {
  const [track] = xspf.playlist.trackList[0].track
  return decode(track.title[0])
}
