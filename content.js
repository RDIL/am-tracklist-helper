/**
 * The HTML we're targeting can be previewed at https://gist.github.com/RDIL/18044626c5ab4da79b1a16e2fd576096
 */

console.log("Tracklist helper: extension activated!")

function styleButton(button) {
    button.classList.add("tracklist-helper-btn")
    button.style.marginLeft = "10px"
    button.style.borderRadius = "5px"
    button.style.border = "none"
    button.style.backgroundColor = "#1db954"
    button.style.color = "white"
    button.style.padding = "5px"
    button.style.cursor = "pointer"
    button.style.maxWidth = "30px"
}

/**
 * Creates the copy tracklist button, styling it to match the other primary action buttons.
 * Apple Music uses Svelte, so the class names are subject to change.
 * @returns {HTMLDivElement}
 */
function createPrimaryActionButton() {
    const selectorShuffle = ".primary-actions__button--shuffle"
    const existingShuffleButton = document.querySelector(selectorShuffle)

    const shuffleOuterChild = existingShuffleButton?.children?.[0]
    const shuffleInnerChild = shuffleOuterChild?.children?.[0]

    const button = document.createElement("div")

    button.classList.add("tracklist-helper-btn")
    button.classList.add(...(existingShuffleButton?.classList || []))
    button.classList.remove(selectorShuffle.substring(1))

    const buttonActionOuter = document.createElement("div")
    buttonActionOuter.classList.add(...(shuffleOuterChild?.classList || []))

    const buttonActionInner = document.createElement("button")
    buttonActionInner.classList.add(...(shuffleInnerChild?.classList || []))
    buttonActionInner.innerText = "Copy Tracklist"

    buttonActionOuter.appendChild(buttonActionInner)
    button.appendChild(buttonActionOuter)

    return button
}

function getArtistNames(artists) {
    let artistNameString = ""

    if (artists.length === 1) {
        return artists[0].innerText
    }

    if (artists.length === 2) {
        return `${artists[0].innerText} & ${artists[1].innerText}`
    }

    for (let i = 0; i < artists.length; i++) {
        const artist = artists[i]

        if (i === artists.length - 1) {
            artistNameString += `& ${artist.innerText}`
            break
        }

        artistNameString += `${artist.innerText}, `
    }

    // remove the last comma
    return artistNameString.replace(", &", " &")
}

function doTheThing() {
    if (document.querySelector(".tracklist-helper-btn")) {
        // we've already got buttons here, so don't do anything
        return
    }

    let tracklistString = ""

    const songs = document.querySelectorAll("[data-testid='track-title']")

    for (const song of songs) {
        const titleButton = document.createElement("button")
        titleButton.innerText = "CT"
        styleButton(titleButton)

        titleButton.addEventListener("click", () => {
            navigator.clipboard.writeText(song.innerText)
        })

        tracklistString += `${song.innerText}`

        song.parentElement.appendChild(titleButton)

        const artists = song.parentElement.parentElement.querySelectorAll(
            "[data-testid='click-action']",
        )

        if (artists.length < 1) {
            tracklistString += "\n"
            continue
        }

        let artistNameString = getArtistNames(artists)

        const artistButton = document.createElement("button")
        artistButton.innerText = "CA"
        styleButton(artistButton)

        artistButton.addEventListener("click", () => {
            navigator.clipboard.writeText(artistNameString)
        })

        tracklistString += ` - ${artistNameString}\n`

        song.parentElement.appendChild(artistButton)
    }

    // create a button to copy the entire tracklist
    const primaryActions = document.querySelector(".primary-actions")

    if (!primaryActions) {
        return
    }

    const copyFullListButton = createPrimaryActionButton()

    copyFullListButton.addEventListener("click", () => {
        navigator.clipboard.writeText(tracklistString)
    })

    primaryActions.appendChild(copyFullListButton)
}

// long story short... the tracklist is not always loaded when the page is loaded,
// so we'll just wait for a user click and then add buttons
document.addEventListener("click", doTheThing)
