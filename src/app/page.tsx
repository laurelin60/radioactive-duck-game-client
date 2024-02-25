"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
// @ts-expect-error can't find declaration file
import * as handpose from "@tensorflow-models/handpose";
import * as fp from "fingerpose";

import "@tensorflow/tfjs-backend-webgl";

import { RiCameraFill, RiCameraOffFill } from "react-icons/ri";
import Webcam from "react-webcam";

import { Signimage, Signpass } from "../components/handimage";
import Handsigns from "../components/handsigns";
import { drawHand } from "../utils/handposeutil";

export default function Home() {
    const webcamRef = useRef<Webcam | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const [camState, setCamState] = useState(true);

    const [sign, setSign] = useState<string | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [signList, setSignList] = useState<string | any[]>([]);

    let currentSign = 0;

    let gamestate = "started";

    /**
     * Runs the hand recognition model
     * 1. Inits the model from tensorflow.js
     * 2. Sets up sign list
     * 3. Runs ML model every X milliseconds
     */
    const runHandpose = async () => {
        const net = await handpose.load();
        handleSignList();

        setInterval(() => {
            detect(net);
        }, 150);
    };

    const handleSignList = () => {
        setSignList(shuffle(Signpass));
    };

    /* any is used to avoid errors w/ build */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function shuffle(a: { src: any; alt: string }[]) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async function detect(net: any) {
        /* Check if webcam is available */
        if (
            webcamRef.current &&
            webcamRef.current.video &&
            webcamRef.current.video.readyState === 4
        ) {
            /* Get video properties */
            const video = webcamRef.current.video;
            const videoWidth = webcamRef.current.video.videoWidth;
            const videoHeight = webcamRef.current.video.videoHeight;

            /* Set video width */
            webcamRef.current.video.width = videoWidth;
            webcamRef.current.video.height = videoHeight;

            /* Set canvas height and width */
            if (canvasRef.current) {
                canvasRef.current.width = videoWidth;
                canvasRef.current.height = videoHeight;
            }

            /* Make Detections */
            const hand = await net.estimateHands(video);

            if (hand.length > 0) {
                /* Load the fingerpose model */
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

                const estimatedGestures = GE.estimate(hand[0].landmarks, 6.5);
                // document.querySelector('.pose-data').innerHTML =JSON.stringify(estimatedGestures.poseData, null, 2);

                if (gamestate === "started") {
                    // document.querySelector("#app-title").innerText =
                    //     "Make a 👍 gesture with your hand to start";
                }

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
                        handleSignList();
                        gamestate = "played";
                        // document
                        //     .getElementById("emojimage")
                        //     .classList.add("play");
                        // document.querySelector(".tutor-text").innerText =
                        //     "make a hand gesture based on letter shown below";
                    } else if (gamestate === "played") {
                        // document.querySelector("#app-title").innerText = "";

                        //looping the sign list
                        if (currentSign === signList.length) {
                            handleSignList();
                            currentSign = 0;
                            return;
                        }

                        // console.log(signList[currentSign].src.src)

                        //game play state

                        if (
                            typeof signList[currentSign].src.src === "string" ||
                            signList[currentSign].src.src instanceof String
                        ) {
                            // document
                            //     .getElementById("emojimage")
                            //     .setAttribute(
                            //         "src",
                            //         signList[currentSign].src.src,
                            //     );
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

            /* Draw hand lines */
            if (canvasRef.current) {
                const ctx = canvasRef.current.getContext("2d");
                drawHand(hand, ctx);
            }
        }
    }

    useEffect(() => {
        runHandpose();
    }, []);

    const handleCamera = () => {
        if (camState) {
            setCamState(false);
        } else {
            setCamState(true);
        }
    };

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

                    {/* <pre
                        className="pose-data"
                        color="white"
                        style={{
                            position: "fixed",
                            top: "150px",
                            left: "10px",
                        }}
                    >
                        Pose data
                    </pre> */}
                </div>

                <div id="start-button" className="flex-center gap-4 flex-row">
                    <Button onClick={handleCamera} className="bg-orange-500">
                        {camState ? (
                            <div className="space-x-4">
                                <p>Turn Off</p> <RiCameraOffFill size={20} />
                            </div>
                        ) : (
                            <div className="space-x-4">
                                <p>Turn On</p> <RiCameraFill size={20} />
                            </div>
                        )}
                        Camera
                    </Button>
                </div>
            </main>
        </>
    );
}
