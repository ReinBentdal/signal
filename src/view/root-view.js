"use strict"

class RootView {
  constructor() {
    this.loadView()
    this.emitter = {}
    this.trackId = 0
    this.quantizer = new Quantizer(TIME_BASE)
    riot.observable(this.emitter)
  }

  setSong(song) {
    this.song = song
    this.toolbar.update({song: song})
    this.trackList.update({song: song})
    this.pianoRoll.track = song.getTrack(0)
  }

  loadView() {
    riot.compile(() => {
      this.trackInfoPane = riot.mount("track-info")[0]
      this.propertyPane = riot.mount("property-pane")[0]
      this.toolbar = riot.mount("toolbar")[0]
      this.eventPane = riot.mount("event-table")[0]
      this.trackList = riot.mount("track-list")[0]
      this.pianoRoll = new PianoRollController(document.querySelector("#piano-roll"))

      this.viewDidLoad()
    })
  }

  changeTrack(trackId) {
    this.trackId = trackId
    const track = this.song.getTrack(trackId)
    this.pianoRoll.track = track
    this.trackInfoPane.update({track: track})
    this.trackList.update({selectedTrackId: trackId})
  }

  viewDidLoad() {
    this.toolbar.update({
      onChangeFile: e => {
        const file = e.target.files[0]
        if (file.type != "audio/mid" && file.type != "audio/midi") {
          return
        }
        this.emitter.trigger("change-file", file)
      },

      onClickPencil: e => {
        this.pianoRoll.mouseMode = 0
      },

      onClickSelection: e => {
        this.pianoRoll.mouseMode = 1
      },

      onClickScaleUp: e => {
        this.pianoRoll.noteScale = {
          x: this.pianoRoll.noteScale.x + 0.1,
          y: this.pianoRoll.noteScale.y,
        }
      },

      onClickScaleDown: e => {
        this.pianoRoll.noteScale = {
          x: Math.max(0.05, this.pianoRoll.noteScale.x - 0.1),
          y: this.pianoRoll.noteScale.y,
        }
      },

      onSelectTrack: e => {
        this.changeTrack(e.value)
      },

      onSelectQuantize: e => {
        SharedService.quantizer.denominator = e.value
      },

      onClickPlay: e => {
        SharedService.player.prepare(this.song)
        SharedService.player.play()
      },

      onClickStop: e => {
        if (SharedService.player.isPlaying) {
          SharedService.player.stop()
        } else {
          SharedService.player.stop()
          SharedService.player.position = 0
        }
      },

      onClickBackward: e => {
        SharedService.player.position -= TIME_BASE * 4
      },

      onClickForward: e => {
        SharedService.player.position += TIME_BASE * 4
      }
    })

    this.pianoRoll.emitter.on("select-notes", events => {
      this.propertyPane.update({notes: events})
    })

    this.pianoRoll.emitter.on("move-cursor", tick => {
        const t = SharedService.quantizer.floor(tick)
        SharedService.player.seek(t)
    })

    this.propertyPane.emitter.on("update-note", e => {
      this.song.getTrack(this.trackId).updateEvent(e.id, e)
    })

    this.propertyPane.emitter.on("update-notes", changes => {
      this.song.getTrack(this.trackId).transaction(it => {
        changes.forEach(c => it.updateEvent(c.id, c))
      })
    })

    this.trackList.emitter.on("select-track", trackId => {
      this.changeTrack(trackId)
    })

    this.emitter.trigger("view-did-load")
  }
}
