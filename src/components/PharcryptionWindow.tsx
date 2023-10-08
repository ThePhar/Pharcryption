import { Component, onMount } from "solid-js";

import Window from "./Window";
import PharcryptionState, { ItemDataTable } from "../PharcryptionState";

import "../stylesheets/PharcryptionWindow.css";
import pharcryption from "../assets/lock.png";
import { GamePhase } from "../enums/GamePhase";


type PharcryptionWindowProps = {
    hidden: boolean;
    onclose: () => void;
};

const PharcryptionWindow: Component<PharcryptionWindowProps> = (props) => {
    setInterval(() => {
        // Items Remaining
        const itemsRemainingElement = document.querySelector("#items_remaining") as HTMLElement;
        const totalBlocksElement = document.querySelector("#blocks_total") as HTMLElement;
        const itemsPerBlockElement = document.querySelector("#items_per_block") as HTMLElement;
        const percentageElement = document.querySelector("#percentage") as HTMLElement;
        let blocks = 0, itemsPerBlock = 0, totalItemsEncrypted = 0, remainingItemsEncrypted = 0;
        for (const blockProperty in PharcryptionState.state.itemDataTable()) {
            blocks++;
            itemsPerBlock = 0;
            for (const itemProperty in PharcryptionState.state.itemDataTable()[blockProperty]) {
                itemsPerBlock++;
                totalItemsEncrypted++;
                if (!PharcryptionState.state.itemDataTable()[blockProperty][itemProperty].unlocked) {
                    remainingItemsEncrypted++;
                }
            }
        }

        itemsRemainingElement.innerText = `${remainingItemsEncrypted}/${totalItemsEncrypted}`;
        totalBlocksElement.innerText = blocks.toString();
        itemsPerBlockElement.innerText = itemsPerBlock.toString();
        percentageElement.innerText = PharcryptionState._client.data.slotData.percentage.toString();

        // Time Limit
        const timeRemainingElement = document.querySelector("#time_remaining") as HTMLElement;
        if (PharcryptionState.state.timelimit() === 0) {
            timeRemainingElement.innerText = "Timer Disabled";
            return;
        }

        const distance = PharcryptionState.state.timelimit() - new Date().getTime();
        if (distance < 0) {
            timeRemainingElement.innerText = "00d 00:00:00";
            PharcryptionState.state._func.updatePhase(GamePhase.POST_GAME);
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        timeRemainingElement.innerText = 
            `${days.toString().padStart(2, "0")}d ` +
            `${hours.toString().padStart(2, "0")}:` +
            `${minutes.toString().padStart(2, "0")}:` +
            `${seconds.toString().padStart(2, "0")}`;
    }, 1000);

    onMount(() => {
        // Scroll explaination to top.
        const explainationElement = document.querySelector(".explaination") as HTMLElement;
        explainationElement.scrollTop = 0;
    });

    return (
        <Window width={640} title="Pharcryptor" icon={pharcryption} hidden={props.hidden} onclose={props.onclose}>
            <div class="PharcryptionWindow">
                <div class="sidebar">
                    <img class="lockbanner" src={pharcryption}></img>
                    <div class="block">
                        <h3>Your items will be lost on</h3>
                        <span id="timelimit">{
                            PharcryptionState.state.timelimit() === 0
                                ? "Timer Disabled"
                                : new Date(PharcryptionState.state.timelimit()).toLocaleString()
                        }</span>
                        <br /><br />
                        <b>Time Remaining</b>
                        <br />
                        <div id="time_remaining" class="yellow">00d 00:00:00</div>
                    </div>
                    <div class="block">
                        <h3>Total Encrypted Blocks</h3>
                        <span><b id="blocks_total">13</b> Blocks / <b id="items_per_block">50</b> Items per Block<br /><b id="percentage"></b>% Req. decrypted per block.</span>
                        <br /><br />
                        <b>Remaining Items Encrypted</b>
                        <br />
                        <div id="items_remaining" class="yellow">0/0</div>
                    </div>
                </div>
                <div class="mainbar">
                    <h1>Oopsie! Your items have been encrypted!</h1>
                    <div class="explaination">
                        <strong>What happened to our multiworld?</strong><br />
                        I'm afraid that many of your keys, upgrades, equipment, and other miscellaneous important items
                        are no longer accessible because they have been encrypted. You might think that you can recover
                        your items, but do not waste your time. Nobody can recover your items without our decryption
                        service.<br /><br />

                        <strong>Can we recover our items?</strong><br />
                        Absolutely, we can guarantee that you can recover your items, but it will cost you and you don't
                        have much time to act. Our advanced AI-powered encryption software has identified which of your
                        items have the most value and has encrypted them. You can recover your items by paying us a
                        small fee in our own cryptocurrency, Pharcoin, utilziing the included Item Decryptor program we
                        included on your desktop.<br /><br />

                        <strong>How do we pay and what is a Pharcoin?</strong><br />
                        We only accept Pharcoin as payment for our decryption service. Pharcoin is a cryptocurrency
                        that we created to ensure that we can provide our service to you as quickly as possible. You
                        can purchase Pharcoins for the low low price of $1,000,000 USD per Pharcoin. If that is too
                        expensive for you, you can also mine Pharcoins using the included Pharcoin Miner program we
                        included on your desktop by tapping into other worlds that harbor Pharcoin data. Once you 
                        have enough Pharcoins, you can use the Item Decryptor program to decrypt your items.<br /><br />

                        <strong>What happens if we don't pay in time?</strong><br />
                        If you do not pay us within the time limit, we will delete your items permanently. We will also
                        brick the Item Decryptor program and you will never be able to recover your items again. Do not
                        attempt to recover your items without our tools, as it is impossible.<br /><br />

                        <strong>What is a block?</strong><br />
                        A block is a group of items that are encrypted together. In an effort to make us more money, we
                        have decided to encrypt your items in blocks. This means that you will have to pay and
                        decrypt enough items in each preceeding block before you can decrypt items in the next block.
                        You can view the number of blocks and the number of items per block on the left side of the
                        screen and in our Item Decryptor program.<br /><br />

                        <strong>We've discovered a bug and our items aren't decrypted!</strong><br />
                        If you have discovered a bug, please report it to our liason, Phar, in discord @thephar. If you
                        cannot recover due to this bug, you can reach out to the multiworld host to see if they can
                        provide you with the "Decryption Key" that you can use to decrypt your items manually. This 
                        option should only be used as a last resort.
                    </div>
                </div>
            </div>
        </Window>
    );
};

export default PharcryptionWindow;
