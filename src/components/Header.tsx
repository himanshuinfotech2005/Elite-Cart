

import { auth, currentUser } from '@clerk/nextjs/server'
import CartIcon from './CartIcon'
import Container from './Container'
import FavoriteButton from './FavoriteButton'
import HeaderMenu from './HeaderMenu'
import Logo from './Logo'
import MobileMenu from './MobileMenu'
import SearchBar from './SearchBar'
import SignIn from './SignIn'
import { ClerkLoaded, SignedIn, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { Logs } from 'lucide-react'
import { getMyOrders } from '@/sanity/queries'

const Header = async() => {
  const user =await currentUser();
   const { userId } = await auth();
  let orders = null;
  if (userId) {
    orders = await getMyOrders(userId);
  }
  
  
  return (
    <header className='bg-white/70 py-5 sticky top-0 z-50 backdrop-blur-md'  >
      <Container className='flex items-center justify-between
      text-lightColor'>
        <div className='w-auto md:w-1/3 flex items-center
        gap-2.5 justify-start md:gap-0'>
          <MobileMenu/>
          <Logo className={''}/>
          
        </div>
        
        <HeaderMenu/>
        <div className='w-auto md:w-1/3 flex items-center justify-end gap-5'>
          <SearchBar/>
          <CartIcon/>
          <FavoriteButton/>
          <ClerkLoaded>
            <SignedIn>
              <Link href={"/orders"}>
              <Logs/>
              </Link>
              <UserButton/>
            </SignedIn>
            {!user && <SignIn/>}
          </ClerkLoaded>
          
        </div>
      </Container>
    </header>
  )
}

export default Header