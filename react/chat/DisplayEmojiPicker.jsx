import React from 'react';
import { Button, OverlayTrigger, Popover } from 'react-bootstrap';
import Picker from 'emoji-picker-react';

const DisplayEmojiPicker = (props) => {
    const { onEmojiClick } = props;

    return (
        <>
            <OverlayTrigger
                trigger='click'
                rootClose
                delay={100}
                placement='top'
                overlay={
                    <Popover id={'picker'} className='emojiPicker'>
                        <Picker onEmojiClick={onEmojiClick}
                            disableSearchBar='true'
                            disableSkinTonePicker='true'
                            pickerStyle={{ boxShadow: 'none' }}
                        />
                    </Popover>
                }
            >
                <Button bsPrefix='EmojiBtn' className='chatMessageEmojiBtn' variant='outline-secondary'>
                    <i className='far fa-smile fa-lg chatMessageIcon' id='basic-addon2' />
                </Button>
            </OverlayTrigger>
        </>
    )
}
export default DisplayEmojiPicker;