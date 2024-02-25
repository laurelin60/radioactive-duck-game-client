"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
// @ts-expect-error can't find declaration file
import * as handpose from "@tensorflow-models/handpose";
import * as fp from "fingerpose";

import "@tensorflow/tfjs-backend-webgl";
import "@tensorflow/tfjs-backend-cpu";

import { cn } from "@/lib/utils";
import { RiCameraFill, RiCameraOffFill } from "react-icons/ri";
import Webcam from "react-webcam";

import { Signimage, Signpass } from "../components/handimage";
import Handsigns from "../components/handsigns";
import { drawHand } from "../utils/handposeutil";

export default function Home() {
    const webcamRef = useRef<Webcam | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const [camState, setCamState] = useState(true);

    const [sign, setSign] = useState<string>("");
    const [signImage, setSignImage] = useState<string>("");
    const [instructionText, setInstructionText] = useState("");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let signList: string | any[];

    let currentSign = 0;

    let gamestate = "started";

    /**
     * Runs the hand recognition model
     * 1. Inits the model from tensorflow.js
     * 2. Sets up sign list
     * 3. Runs ML model every X milliseconds
     */
    const runHandpose = async () => {
        setInstructionText("Loading models...");
        const net = await handpose.load();
        handleSignList();

        setInterval(() => {
            detect(net);
        }, 150);
    };

    const handleSignList = () => {
        const fullyhacks = [
            Signpass[5], // F
            Signpass[20], // U
            Signpass[11], // L
            Signpass[11], // L
            Signpass[24], // Y
            Signpass[7], // H
            Signpass[0], // A
            Signpass[2], // C
            Signpass[10], // K
            Signpass[18], // S
        ];

        signList = fullyhacks;

        // signList = shuffle(Signpass);
    };

    /* any is used to avoid errors w/ build */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
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
                    setInstructionText(
                        "Make a 👍 gesture with your hand to start",
                    );
                }

                if (
                    estimatedGestures.gestures !== undefined &&
                    estimatedGestures.gestures.length > 0
                ) {
                    const confidence = estimatedGestures.gestures.map(
                        // @ts-expect-error confidence does exist
                        (p) => p.confidence,
                    );
                    const maxConfidence = confidence.indexOf(
                        Math.max.apply(undefined, confidence),
                    );

                    /* Check for thumb emoji to begin game */
                    if (
                        estimatedGestures.gestures[maxConfidence].name ===
                            "thumbs_up" &&
                        gamestate !== "played"
                    ) {
                        handleSignList();
                        gamestate = "played";

                        setInstructionText(
                            "make a hand gesture based on letter shown below",
                        );
                    } else if (gamestate === "played") {
                        /* Reset the sign list if completed */
                        if (currentSign === signList.length) {
                            handleSignList();
                            currentSign = 0;
                            return;
                        }

                        /* Gameplay state */
                        if (
                            typeof signList[currentSign].src.src === "string" ||
                            signList[currentSign].src.src instanceof String
                        ) {
                            setSignImage(signList[currentSign].src.src);
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
            <main className="bg-[#5784BA] min-h-[100vh] max-h-[100vh]">
                <div className="flex items-center flex-col h-full wrapper py-0">
                    <div className="z-10 pt-24">
                        <h1 className="text-4xl text-center font-bold">
                            Radioactive Duck Game 🦆
                        </h1>
                        <p>Current Instruction: {instructionText}</p>
                    </div>

                    <div
                        id="webcam-container"
                        className="fixed w-full h-full mx-auto flex-center"
                    >
                        {camState ? (
                            <Webcam
                                id="webcam"
                                className="fixed h-[50%] w-[50%] flex mx-auto object-cover -scale-x-100"
                                ref={webcamRef}
                            />
                        ) : (
                            <div id="webcam" className="bg-black" />
                        )}

                        {/* At bottom of page, indicates what the model is "seeing" */}
                        {sign ? (
                            <div className="absolute flex-center flex-col mx-auto right-[calc(50% - 50px)] bottom-[100px] text-center z-50 mx-auto left-1/2 -translate-x-1/2">
                                <div className="text-white text-lg mb-1">
                                    detected gestures
                                </div>
                                <img
                                    alt="signImage"
                                    // @ts-expect-error src does exist
                                    src={Signimage[sign]?.src}
                                    style={{
                                        height: 30,
                                    }}
                                />
                            </div>
                        ) : (
                            " "
                        )}

                        {/* Renders the hand tracing */}
                        <canvas
                            id="gesture-canvas"
                            className="fixed h-[50%] w-[50%] object-cover z-10 -scale-x-100 left-1/2 -translate-x-1/2"
                            ref={canvasRef}
                        />
                    </div>

                    {/* At top of page, indicates the current letter */}
                    {signImage && (
                        <img
                            className={cn(
                                "h-40 object-contain border-none z-50 bg-black bg-center",
                            )}
                            id="emojimage"
                            src={signImage}
                            alt="signImage"
                        />
                    )}

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

                <div
                    id="start-button"
                    className="flex gap-8 flex-row fixed self-center bottom-10 mx-auto left-1/2 -translate-x-1/2 z-20"
                >
                    <Button
                        onClick={handleCamera}
                        className="bg-orange-500 hover:bg-orange-500/80"
                    >
                        {camState ? (
                            <div className="space-x-4 flex">
                                <p>Turn Off</p> <RiCameraOffFill size={20} />
                            </div>
                        ) : (
                            <div className="space-x-4 flex">
                                <p>Turn On</p> <RiCameraFill size={20} />
                            </div>
                        )}
                    </Button>
                </div>
            </main>
        </>
    );
}
