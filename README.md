# Mini TFM-Player

A player for the [TruckersFM](https://truckers.fm) audio stream as pop-up window <ins>inspired</ins> by the [TruckersFM pop-up](https://truckers.fm/popout/).

**Special thanks to TruckersFM for making the API usable on other sites.**

<br>

## Features
- play and pause the audio stream
- set audio volume
- resync audio *with station*
- showing song details and cover image
- showing current presenter
- dark and light mode support
- automatic pausing TFM API requests when page not visible (exluding music playback)
- *all-in-one page*

## Missing features compared to the TFM pop-up
- send requests, shoutouts, ...
- upcoming presenters / shows
- recently played songs
- social media links

<br>
<br>

I use icons from [Google Fonts](https://fonts.google.com/icons).<br>
To avoid sending multiple requests per minute to the TruckersFM API, I use a modified version of [Icecast MetadataJS.](https://github.com/eshaz/icecast-metadata-js)
The [custom images](https://github.com/Appstun/Mini-TFM-Player/tree/main/out/images) are designed by me. (inspired by TruckersFM)

<br>

> [!TIP]
> If you have **Always On Top** in [PowerToys](https://learn.microsoft.com/windows/powertoys/) activated, you can use it to pin the pop-up window to the top of the screen. <br>
> You can download and install it from the [Github Releases](github.com/microsoft/PowerToys/releases/latest) or from the [Microsoft Store](apps.microsoft.com/detail/xp89dcgq3k6vld). Then activate the `Always On Top` module and use the key combination of this module on the pop-up window. <br> > *Alternatively, you can also use any other program that pins a window to the top of the screen.*
