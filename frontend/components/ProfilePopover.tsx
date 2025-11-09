"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCustomWallet } from "@/contexts/CustomWallet";
import { ExternalLink } from "lucide-react";
import Speech from "./Speech";

export default function ProfilePopover() {
  const { isConnected, logout, redirectToAuthUrl, emailAddress, address } =
    useCustomWallet();

    return (
      <Popover>
        <PopoverTrigger asChild>
          <div style={{ display: 'flex', justifyContent: 'center', position: 'fixed', top: '45px', right: '45px', width: 'max-content', zIndex: 100 }}>
            <Avatar className="block sm:hidden">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </div>
        </PopoverTrigger>
        <PopoverContent style={{
          background: 'rgba(255, 255, 255, 0.5)', color: '#fefefe', border: 'none',
          marginTop: '10px',
          boxShadow: '3px 3px 20px 3px rgba(0, 0, 0, 0.5)',
          outline: '3px solid rgba(255, 255, 255, 1)',
          backdropFilter: 'blur(10px)',
        }}>
          <Card className="border-none shadow-none" style={{ background: 'transparent', color: '#fefefe' }}>
            {/* <Button variant={'ghost'} size='icon' className="relative top-0 right-0" onClick={getAccountInfo}><RefreshCw width={16} /></Button> */}
            <CardHeader>
              <CardTitle className="woopie">ACCOUNT INFO</CardTitle>
            </CardHeader>
            <CardContent>
              <>
                <div className="flex flex-row gap-1 items-center t" style={{ display: 'flex', color: '#2c2e36' }}>
                  <span style={{ marginRight: '5px' }}>Address: </span>
                  <div className="flex flex-row gap-1">
                    <span>{`${address?.slice(0, 5)}...${address?.slice(
                      63
                    )}`}</span>
                    <a
                      href={`https://suiscan.xyz/testnet/account/${address}`}
                      target="_blank"
                    >
                      <ExternalLink width={12} />
                    </a>
                  </div>
                </div>
              </>
            </CardContent>
            <CardFooter className="flex flex-row gap-2 items-center justify-between">
              <Button
                variant={"destructive"}
                className="w-full text-center woopie"
                onClick={logout}
                style={{ background: '#f04747', color: '#fefefe', fontStyle: 'italic', width: '100%', fontSize: '1.2rem' }}
              >
                LOGOUT
              </Button>
            </CardFooter>
          </Card>
        </PopoverContent>
        <Speech />
      </Popover>
    );
}
