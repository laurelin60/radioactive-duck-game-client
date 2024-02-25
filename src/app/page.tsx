"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
// import {
//     Box,
//     Button,
//     Container,
//     Heading,
//     Image,
//     Stack,
//     Text,
//     VStack,
// } from "@chakra-ui/react";

// @ts-expect-error can't find declaration file
import * as handpose from "@tensorflow-models/handpose";
// import * as tf from "@tensorflow/tfjs";
import * as fp from "fingerpose";

// import "../styles/App.css"

import "@tensorflow/tfjs-backend-webgl";

import { RiCameraFill, RiCameraOffFill } from "react-icons/ri";
import Webcam from "react-webcam";

import { Signimage, Signpass } from "../components/handimage";
import Handsigns from "../components/handsigns";
import { drawHand } from "../utils/handposeutil";

export default function Home() {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);

    const [camState, setCamState] = useState(false);

    const [sign, setSign] = useState<string | null>(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let signList: string | any[] = [];
    let currentSign = 0;

    let gamestate = "started";

    async function runHandpose() {
        console.log("in handpose");
        const net = await handpose.load();
        _signList();

        // window.requestAnimationFrame(loop);

        setInterval(() => {
            void detect(net);
        }, 150);
    }

    function _signList() {
        console.log("in signlist");
        signList = generateSigns();
    }

    /* any is used to avoid errors */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function shuffle(a: { src: any; alt: string }[]) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    function generateSigns() {
        const password = shuffle(Signpass);
        return password;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async function detect(net: any) {
        // Check data is available
        if (
            typeof webcamRef.current !== "undefined" &&
            webcamRef.current !== null &&
            webcamRef.current.video.readyState === 4
        ) {
            // Get Video Properties
            const video = webcamRef.current.video;
            const videoWidth = webcamRef.current.video.videoWidth;
            const videoHeight = webcamRef.current.video.videoHeight;

            // Set video width
            webcamRef.current.video.width = videoWidth;
            webcamRef.current.video.height = videoHeight;

            // Set canvas height and width
            canvasRef.current.width = videoWidth;
            canvasRef.current.height = videoHeight;

            // Make Detections
            const hand = await net.estimateHands(video);

            if (hand.length > 0) {
                //loading the fingerpose model
                const GE = new fp.GestureEstimator([
                    fp.Gestures.ThumbsUpGesture,
                    Handsigns.aSign,
                    Handsigns.bSign,
                    Handsigns.cSign,
                    Handsigns.dSign,
                    Handsigns.eSign,
                    Handsigns.fSign,
                    Handsigns.gSign,
                    Handsigns.hSign,
                    Handsigns.iSign,
                    Handsigns.jSign,
                    Handsigns.kSign,
                    Handsigns.lSign,
                    Handsigns.mSign,
                    Handsigns.nSign,
                    Handsigns.oSign,
                    Handsigns.pSign,
                    Handsigns.qSign,
                    Handsigns.rSign,
                    Handsigns.sSign,
                    Handsigns.tSign,
                    Handsigns.uSign,
                    Handsigns.vSign,
                    Handsigns.wSign,
                    Handsigns.xSign,
                    Handsigns.ySign,
                    Handsigns.zSign,
                ]);

                const estimatedGestures = await GE.estimate(
                    hand[0].landmarks,
                    6.5,
                );
                // document.querySelector('.pose-data').innerHTML =JSON.stringify(estimatedGestures.poseData, null, 2);

                // if (gamestate === "started") {
                //     document.querySelector("#app-title").innerText =
                //         "Make a 👍 gesture with your hand to start";
                // }

                if (
                    estimatedGestures.gestures !== undefined &&
                    estimatedGestures.gestures.length > 0
                ) {
                    const confidence = estimatedGestures.gestures.map(
                        (p) => p.confidence,
                    );
                    const maxConfidence = confidence.indexOf(
                        Math.max.apply(undefined, confidence),
                    );

                    //setting up game state, looking for thumb emoji
                    if (
                        estimatedGestures.gestures[maxConfidence].name ===
                            "thumbs_up" &&
                        gamestate !== "played"
                    ) {
                        _signList();
                        gamestate = "played";

                        document
                            .getElementById("emojimage")!
                            .classList.add("play");
                        // document.querySelector(".tutor-text").innerText =
                        //     "make a hand gesture based on letter shown below";
                    } else if (gamestate === "played") {
                        // document.querySelector("#app-title").innerText = "";

                        //looping the sign list
                        if (currentSign === signList.length) {
                            _signList();
                            currentSign = 0;
                            return;
                        }

                        // console.log(signList[currentSign].src.src)

                        //game play state

                        if (
                            typeof signList[currentSign].src.src === "string" ||
                            signList[currentSign].src.src instanceof String
                        ) {
                            document
                                .getElementById("emojimage")!
                                .setAttribute(
                                    "src",
                                    signList[currentSign].src.src,
                                );
                            if (
                                signList[currentSign].alt ===
                                estimatedGestures.gestures[maxConfidence].name
                            ) {
                                currentSign++;
                            }

                            setSign(
                                estimatedGestures.gestures[maxConfidence].name,
                            );
                        }
                    } else if (gamestate === "finished") {
                        return;
                    }
                }
            }
            // Draw hand lines
            const ctx = canvasRef.current.getContext("2d");
            drawHand(hand, ctx);
        }
    }

    //   if (sign) {
    //     console.log(sign, Signimage[sign])
    //   }

    useEffect(() => {
        runHandpose();
    }, []);

    function handleCamera() {
        setCamState((prevState) => !prevState);
    }

    return (
        <>
            <main className="bg-[#5784BA] h-[100vh]">
                <div className="flex-center flex-col wrapper py-0">
                    <h1 className="text-4xl text-center">
                        Radioactive Duck Game 🦆
                    </h1>

                    <div id="webcam-container">
                        {camState ? (
                            <Webcam id="webcam" ref={webcamRef} />
                        ) : (
                            <div id="webcam" className="bg-black" />
                        )}

                        {sign ? (
                            <div className="absolute mx-auto right-[calc(50% - 50px)] bottom-[100px] text-center">
                                <div className="text-white text-lg mb-1">
                                    detected gestures
                                </div>
                                <img
                                    alt="signImage"
                                    src={
                                        Signimage[sign]?.src
                                            ? Signimage[sign].src
                                            : "/loveyou_emoji.svg"
                                    }
                                    style={{
                                        height: 30,
                                    }}
                                />
                            </div>
                        ) : (
                            " "
                        )}
                    </div>

                    <canvas id="gesture-canvas" ref={canvasRef} style={{}} />

                    <Image
                        className="h-36 object-cover"
                        id="emojimage"
                        src={""}
                        alt="image"
                    />
                    {/* <pre className="pose-data" color="white" style={{position: 'fixed', top: '150px', left: '10px'}} >Pose data</pre> */}
                </div>

                <div id="start-button" className="flex-center gap-4 flex-row">
                    <Button onClick={handleCamera} className="bg-orange-500">
                        {camState ? (
                            <RiCameraFill size={20} />
                        ) : (
                            <RiCameraOffFill size={20} />
                        )}{" "}
                        Camera
                    </Button>
                </div>
            </main>
        </>
    );
}

// export default function Home() {
//     // const { getUser } = getKindeServerSession();
//     // const user = await getUser();

//     // const dbUser = user
//     //     ? await db.user.findFirst({
//     //           where: {
//     //               id: user?.id,
//     //           },
//     //       })
//     //     : null;

//     return (
//         <main className="wrapper flex-center text-3xl md:text-5xl font-semibold min-h-[calc(100vh-6rem)]">

//         </main>
//     );
// }
