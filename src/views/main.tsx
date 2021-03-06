import QRcode from "qrcode.react";
import { useState } from "react";
import { useMutation } from "react-query";
import { getInvoice } from "src/api";
import useCopyClipboard from "src/util/clipboard";
import styled from "styled-components";
import { IndexStyles } from "./styles";

const S = {
  separation: styled.div`
    margin: 0 0 16px;
  `,
  line: styled.div`
    display: flex;
    justify-content: space-between;
    width: 100%;
    font-size: 20px;
  `,
  darkTitle: styled.div`
    color: black;
  `,
  input: styled.input`
    font-size: 20px;
    padding: 5px;
    height: 38px;
    margin: 8px 0;
    border: 1px solid black;
    background: none;
    border-radius: 4px;
    width: 100%;
  `,
  button: styled.button`
    padding: 0;
    width: 100%;
    height: 38px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    background: #000;
    font-family: Ubuntu, sans-serif;
    font-size: 100%;

    border: none;
    outline: none;
    color: #ffffff;
    background: #111;
    cursor: pointer;
    position: relative;
    z-index: 0;
    border-radius: 10px;

    :before {
      content: "";
      background: linear-gradient(#7b68ee, #9457eb, #6050dc, #5218fa, #5a4fcf);
      position: absolute;
      top: -2px;
      left: -2px;
      background-size: 400%;
      z-index: -1;
      filter: blur(5px);
      width: calc(100% + 4px);
      height: calc(100% + 4px);
      animation: glowing 20s linear infinite;
      opacity: 0;
      transition: opacity 0.3s ease-in-out;
      border-radius: 10px;
    }

    :active {
      color: #000;
    }

    :active:after {
      background: transparent;
    }

    :hover:before {
      opacity: 1;
    }

    :after {
      z-index: -1;
      content: "";
      position: absolute;
      width: 100%;
      height: 100%;
      background: #111;
      left: 0;
      top: 0;
      border-radius: 10px;
    }

    :disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    @keyframes glowing {
      0% {
        background-position: 0 0;
      }
      50% {
        background-position: 400% 0;
      }
      100% {
        background-position: 0 0;
      }
    }
  `,
};

export const Main = ({ max, min }: { max: number; min: number }) => {
  const [amount, setAmount] = useState<number>(Math.max(0, min));
  const [isCopied, copy] = useCopyClipboard({ successDuration: 3000 });

  const mutation = useMutation(getInvoice);

  if (mutation.error) {
    return (
      <div>We Ran Into An Error Creating The Invoice. Please Try Again!</div>
    );
  }

  if (mutation.data?.pr) {
    return (
      <>
        <IndexStyles.copyButton onClick={() => copy(mutation.data.pr)}>
          {isCopied ? (
            <IndexStyles.copied>Copied</IndexStyles.copied>
          ) : (
            <IndexStyles.copy>Click To Copy Invoice</IndexStyles.copy>
          )}
          <QRcode value={mutation.data.pr} size={240} />
        </IndexStyles.copyButton>
        <IndexStyles.info>Scan QR Code</IndexStyles.info>
      </>
    );
  }

  return (
    <>
      <S.separation>
        <S.line>
          <S.darkTitle>Min.</S.darkTitle>
          <div>{`${min} sats`}</div>
        </S.line>
        <S.line>
          <S.darkTitle>Max.</S.darkTitle>
          <div>{`${max} sats`}</div>
        </S.line>
      </S.separation>
      <S.line>
        <S.darkTitle>Total Amount</S.darkTitle>
        <div>{`${amount} sats`}</div>
      </S.line>
      <S.input
        onBlur={() => {
          if (amount < min) {
            setAmount(min);
          } else if (amount > max) {
            setAmount(max);
          }
        }}
        placeholder={"Sats"}
        value={amount}
        type={"number"}
        onChange={(e) => setAmount(Number(e.target.value))}
      />
      <S.button
        disabled={mutation.isLoading}
        onClick={() => mutation.mutate({ amount })}
      >
        Create Invoice
      </S.button>
    </>
  );
};
