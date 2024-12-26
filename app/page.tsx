import Image from "next/image";
import ChatInterface from "./components/ChatInterface";
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import StytchProvider from "./components/StytchProvider";




export default async function Home() {
  return (
    

    <div className="bg-yellow-200 ">

     <ChatInterface/>
    </div>
  );
}
