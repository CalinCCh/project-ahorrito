import Link from "next/link";
import Image from "next/image";

export const HeaderLogo = () => {
    return (
        <Link href="/">
            <div className="items-center hidden lg:flex">
                <Image src="/logo.svg" alt="Logo" width={50} height={50}/>
                <p className="font-semibold text-white text-2xl ml-2.5">
                    Ahorrito
                    </p> 
            </div>
        </Link>
    )}