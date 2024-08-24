/**
 * The HTML we're targeting can be previewed at https://gist.github.com/RDIL/18044626c5ab4da79b1a16e2fd576096
 */

console.log("Tracklist helper: extension activated!")

function styleInlineButton(button, display, title) {
    button.classList.add("tracklist-helper-btn")
    button.title = title
    button.innerText = display
    button.style.flex = "0 0 auto"
    button.style.borderRadius = "5px"
    button.style.border = "none"
    button.style.backgroundColor = "#1db954"
    button.style.color = "white"
    button.style.padding = "5px"
    button.style.cursor = "pointer"
    button.style.maxWidth = "30px"
}

function createButtonHolder() {
    const buttonHolder = document.createElement("div")
    buttonHolder.style.display = "flex"
    buttonHolder.style.flexDirection = "row"
    buttonHolder.style.justifyContent = "flex-end"
    buttonHolder.style.gap = "10px"
    return buttonHolder
}

/**
 * Helper function to create a styled Button
 * @param {string} innerText
 * @param {string} buttonClass
 * @param {array} outerClasses
 */
function createButton(innerText, buttonClass, outerClasses = []) {
    const outerDiv = document.createElement("div")
    const innerButton = document.createElement("button")

    outerDiv.classList.add(...outerClasses)
    innerButton.classList.add(buttonClass, ...outerClasses)
    innerButton.innerText = innerText
    outerDiv.appendChild(innerButton)
    return outerDiv
}

/**
 * Creates the copy tracklist + copy album artists buttons, styling
 * them to match the other primary action buttons. Apple Music uses
 * Svelte, so the class names are subject to change.
 * @returns {[Element, Element]}
 */
function createPrimaryActionButtons() {
    const selectorPlay = ".primary-actions__button--play"
    const existingPlayButton = document.querySelector(selectorPlay)
    const playOuterChildClasses = existingPlayButton?.children?.[0]?.classList || []

    const trackListButton = createButton("Copy Tracklist", "tracklist-helper-btn", [...existingPlayButton?.classList || [], ...playOuterChildClasses])
    trackListButton.classList.remove(selectorPlay.substring(1))

    const copyPrimariesButton = createButton("Copy Primary Artists", "tracklist-helper-btn", [...existingPlayButton?.classList || [], ...playOuterChildClasses])
    copyPrimariesButton.classList.remove(selectorPlay.substring(1))

    return [trackListButton, copyPrimariesButton]
}

function getArtistNames(artistElements) {
    let artistNameString = ""

    const getArtistName = (element) => {
        const linkElements = Array.from(element.querySelectorAll("a"))
        let artistName = ""

        for (const linkElement of linkElements) {
            const index = linkElements.indexOf(linkElement)
            const hasNext = index < linkElements.length - 1

            if (index === linkElements.length - 1 && linkElements.length > 1) {
                // Checks if this is the last linkElement in the container, and there's more than one linkElement.
                // If true, slices the last comma and space from artistName and adds " & <last artist's name>"
                artistName = artistName.slice(0, -2) + ` & ${linkElement.innerText}`
            } else {
                artistName += hasNext ? `${linkElement.innerText}, ` : linkElement.innerText
            }
        }

        // If artistName exists, returns artistName. If not, returns the innerText of the element.
        return artistName ? artistName : element.innerText
    }

    if (artistElements.length === 1) {
        return getArtistName(artistElements[0])
    }

    if (artistElements.length === 2) {
        return `${getArtistName(artistElements[0])} & ${getArtistName(artistElements[1])}`
    }

    for (let i = 0; i < artistElements.length; i++) {
        const artistName = getArtistName(artistElements[i])
        if (i === artistElements.length - 1) {
            artistNameString += `& ${artistName}`
            break
        }
        artistNameString += `${artistName}, `
    }

    return artistNameString.replace(", &", " &")
}

function run() {
    if (document.querySelector(".tracklist-helper-btn")) {
        // we've already got buttons here, so don't do anything
        return
    }

    let tracklistString = ""

    const songs = document.querySelectorAll("[data-testid='track-title']")

    for (const song of songs) {
        const titleButton = document.createElement("button")
        styleInlineButton(titleButton, "CT", "Copy Track Name")

        titleButton.addEventListener("click", () => {
            navigator.clipboard.writeText(song.innerText)
        })

        const buttonHolder = createButtonHolder()

        song.parentElement.parentElement.appendChild(buttonHolder)
        buttonHolder.appendChild(titleButton)

        const artists = song.parentElement.parentElement.querySelectorAll(".songs-list-row__by-line span")

        if (artists.length < 1) {
            tracklistString += "\n"
            continue
        }

        let artistNameString = getArtistNames(artists)

        const artistButton = document.createElement("button")
        styleInlineButton(artistButton, "CA", "Copy Artist Name")

        artistButton.addEventListener("click", () => {
            navigator.clipboard.writeText(artistNameString)
        })

        tracklistString += `${artistNameString} - ${song.innerText}\n`

        buttonHolder.appendChild(artistButton)
    }

    // create a button to copy the entire tracklist
    const primaryActions = document.querySelector(".primary-actions")

    if (!primaryActions) {
        return
    }

    const primaryArtists = document.querySelector(".headings__subtitles")

    const primaryArtistNames = getArtistNames(primaryArtists?.children)

    const [copyFullListButton, copyPrimaryArtistsButton] = createPrimaryActionButtons()

    copyFullListButton.addEventListener("click", () => {
        navigator.clipboard.writeText(tracklistString)
    })

    copyPrimaryArtistsButton.addEventListener("click", () => {
        navigator.clipboard.writeText(primaryArtistNames)
    })

    primaryActions.appendChild(copyFullListButton)
    primaryActions.appendChild(copyPrimaryArtistsButton)
}

// long story short... the tracklist is not always loaded when the page is loaded,
// so we'll just wait for a user click and then add buttons
document.addEventListener("click", run)
