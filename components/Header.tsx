'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSupabase } from "@/app/supabase-provider"
import { usePathname, useRouter } from "next/navigation"
import { revalidatePath } from "next/cache"

export const Header = () => {

    const loginRoute = "login"
    const signupRoute = "signup"
    const createRoute = "create"
    const pathname = usePathname().split('/')
    const router = useRouter()

    const { supabase, session } = useSupabase()

    const [loggingOut, setLoggingOut] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    const toggleDialog = () => {
        setDialogOpen(!dialogOpen)
    }

    const [isHeaderVisible, setHeaderVisible] = useState(true);
    const [prevScrollPos, setPrevScrollPos] = useState(0);

    useEffect(() => {

        const handleScroll = () => {
            const currentScrollPos: number = window.scrollY;

            //threshold is the height of the header
            const threshold = 55;

            const visible: boolean = prevScrollPos > currentScrollPos || currentScrollPos < threshold;

            setPrevScrollPos(currentScrollPos);
            setHeaderVisible(visible);
        };
        window.addEventListener('scroll', handleScroll);

    }, [prevScrollPos]);

    const logout = async () => {
        try {
            setLoggingOut(true)
            await supabase.auth.signOut();
            console.log("logged out");
            setLoggingOut(false)
            setDialogOpen(false)
            revalidatePath('/')
            router.replace('/');
        } catch (err) {
            console.log(err);
            setLoggingOut(false)
            setDialogOpen(false)
        }
    }

    if (
        pathname[pathname.length - 1] === loginRoute ||
        pathname[pathname.length - 1] === signupRoute ||
        pathname[pathname.length - 1] === createRoute
    ) {
        return <></>
    }
    return (
        <>
            {/* adds the header space back to DOM */}
            <div className={`w-full h-[55px]`}></div>

            <header className={`fixed flex items-center w-full h-[55px] text-white bg-black bg-opacity-80 backdrop-blur-xl border-b-[1px] justify-between text-center p-3 z-40 transition-all duration-150 ${isHeaderVisible ? 'top-0' : '-top-16'}`} >
                <div className="text-xl font-bold text-left">
                    <Link href="/">
                        Logo
                    </Link>
                </div>

                {!session?.user &&
                    <div className="text-right pl-4 border-l-[1px] border-stone-600">
                        <a href={loginRoute}>Login</a>
                    </div>
                }

                {session?.user &&
                    <button
                        className="text-right pl-4 border-l-[1px] border-stone-600"
                        onClick={toggleDialog}
                    >
                        logout
                    </button>
                }
            </header>

            {dialogOpen &&
                <>
                    {/* backdrop */}
                    <div
                        className="absolute flex justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm w-full h-full z-40"
                        onClick={toggleDialog}
                    >
                        {/* dialogBox */}
                        <div className="flex flex-col items-center justify-center gap-6 p-8 bg-slate-800 text-white rounded-md">
                            <h2 className="text-lg font-semibold">
                                Logout?
                            </h2>

                            <div className="flex gap-4 ">
                                <button
                                    className="w-[100px] text-white border-2 border-white py-2 rounded-md font-semibold"
                                    onClick={toggleDialog}
                                    disabled={loggingOut}
                                >
                                    cancel
                                </button>

                                <button
                                    className="w-[100px] bg-red-500 text-white rounded-md font-semibold"
                                    onClick={logout}
                                    disabled={loggingOut}
                                >
                                    {loggingOut ? "logging out" : "logout"}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            }
        </>
    )
}