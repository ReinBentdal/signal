import styled from "@emotion/styled"
import VolumeUp from "mdi-react/VolumeHighIcon"
import { observer } from "mobx-react-lite"
import React, { FC, useCallback } from "react"
import { setTrackVolume } from "../../actions"
import { useStores } from "../../hooks/useStores"
import { Slider } from "../ui/Slider"

const Container = styled.div`
  display: flex;
  flex-grow: 1;
  max-width: 8rem;
  min-width: 5rem;
  margin-left: 1rem;
  margin-right: 1rem;
  align-items: center;
`

const VolumeIcon = styled(VolumeUp)`
  width: 1.3rem;
  height: 2rem;
  color: ${({ theme }) => theme.secondaryTextColor};
  margin-right: 0.5rem;
`

export interface VolumeSliderProps {
  trackIndex: number
}

const _VolumeSlider: FC<VolumeSliderProps> = observer(({ trackIndex }) => {
  const rootStore = useStores()
  const {
    pianoRollStore: { currentVolume },
  } = rootStore
  const volume = currentVolume ?? 100
  const onChange = useCallback(
    (value: number) => setTrackVolume(rootStore)(trackIndex, value),
    [rootStore, trackIndex],
  )
  return (
    <Container>
      <VolumeIcon />
      <Slider
        value={volume}
        onChange={(value) => onChange(value)}
        max={127}
        minStepsBetweenThumbs={1}
      />
    </Container>
  )
})

export const VolumeSlider = React.memo(_VolumeSlider)
