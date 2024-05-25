import styled from "@emotion/styled"
import Color from "color"
import AccountCircle from "mdi-react/AccountCircleIcon"
import { observer } from "mobx-react-lite"
import { useRef } from "react"
import { useLocation } from "wouter"
import { Menu, MenuItem } from "../../components/Menu"
import { auth } from "../../firebase/firebase"
import { IconStyle } from "../../main/components/Navigation/Navigation"
import { useStores } from "../hooks/useStores"
import { Localized } from "../localize/useLocalization"

export const Tab = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center; 
  padding: 0 0.5rem;
  height: 2rem;
  font-size: 0.75rem;
  border-radius: 0.2rem;
  color: ${({ theme }) => theme.secondaryTextColor};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.highlightColor};
  }
  &:active {
    background: ${({ theme }) =>
      Color(theme.secondaryBackgroundColor).lighten(0.1).hex()};
  }

  a {
    color: inherit;
    text-decoration: none;
  }
}
`

export const TabTitle = styled.span`
  margin-left: 0.5rem;

  @media (max-width: 850px) {
    display: none;
  }
`

export const UserButton = observer(() => {
  const ref = useRef<HTMLDivElement>(null)

  const {
    authStore: { authUser, user },
    rootViewStore,
  } = useStores()
  const [_, navigate] = useLocation()

  const onClickSignIn = () => {
    rootViewStore.openSignInDialog = true
  }
  const onClickSignOut = async () => {
    await auth.signOut()
  }
  if (authUser === null) {
    return (
      <Tab onClick={onClickSignIn}>
        <AccountCircle style={IconStyle} />
        <TabTitle>
          <Localized name="sign-in" />
        </TabTitle>
      </Tab>
    )
  }

  return (
    <Menu
      trigger={
        <Tab ref={ref}>
          <AccountCircle style={IconStyle} />
          <TabTitle>{user?.name ?? authUser.displayName}</TabTitle>
        </Tab>
      }
    >
      <MenuItem onClick={() => navigate(`/users/${authUser.uid}`)}>
        <Localized name="profile" />
      </MenuItem>
      <MenuItem onClick={() => navigate("/profile")}>
        <Localized name="edit-profile" />
      </MenuItem>
      <MenuItem onClick={onClickSignOut}>
        <Localized name="sign-out" />
      </MenuItem>
    </Menu>
  )
})
