const Koa = require('koa')
const fetch = require('node-fetch')
const { default: Unsplash } = require('unsplash-js')

Object.defineProperty(global, 'fetch', { value: fetch })

const app = new Koa()
const unsplash = new Unsplash({
  applicationId: process.env.UNSPLASH_ACCESS_KEY,
  secret: process.env.UNSPLASH_SECRET_KEY
})

app.use(async context => {
  const accepts = context.accepts('image', 'css', 'html')
  context.assert(accepts, 406)

  const data = await unsplash.photos.getRandomPhoto()
    .then(response => response.json())
  const url = data.urls.full

  if (accepts === 'image') {
    context.redirect(url)
    return
  }

  const css = `body {
    background-image: -moz-linear-gradient(90deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.5) 100%),
      url(${url});
    background-image: -webkit-linear-gradient(90deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.5) 100%),
      url(${url});
    background-image: linear-gradient(90deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.5) 100%),
      url(${url});
    background-size: cover;
    background-repeat: no-repeat;
  }`

  if (accepts === 'css') {
    context.type = 'css'
    context.body = css
    return
  }

  const html = `<!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Backsplash</title>
    <style>${css}</style>
  </head>
  </html>`
  context.type = 'html'
  context.body = html
})

module.exports = app.callback()

if (require.main === module) {
  app.listen(process.env.PORT)
}
