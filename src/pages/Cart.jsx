import React, { useEffect, useState, useRef } from "react";

const Cart = () => {
  const [barcode, setBarcode] = useState(""); // 입력된 바코드
  const [productList, setProductList] = useState([]);
  const [product, setProduct] = useState({});
  const inputRef = useRef(null); // input 요소 참조

  useEffect(() => {
    // 페이지 로드 시 input에 자동 포커스
    inputRef.current.focus();

    const handleKeyPress = (e) => {
      if (e.key === "Enter") {
        // Enter 키 입력 시 바코드 처리 로직 실행
        sendBarcode(barcode);
        setBarcode(""); // 입력 초기화
      }
    };

    window.addEventListener("keypress", handleKeyPress);
    return () => {
      window.removeEventListener("keypress", handleKeyPress);
    };
  }, [barcode]);

  useEffect(() => {
    setProductList((...prevProductList) => [...prevProductList, product]);
  }, [product]);

  useEffect(() => {
    const maintainFocus = () => {
      if (inputRef.current && document.activeElement !== inputRef.current) {
        inputRef.current.focus(); // 포커스 유지
      }
    };

    const interval = setInterval(maintainFocus, 100); // 주기적으로 확인
    return () => clearInterval(interval); // 클린업
  }, []);

  const sendBarcode = async (barcodeId) => {
    try {
      const response = await fetch(
        `http://192.168.170.240:8080/api/cart/product/${barcodeId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setProduct(data.data);
        console.log("바코드 전송 성공:", data.data);
      } else {
        alert(`바코드 전송 실패: ${response.statusText}`);
        console.error("바코드 전송 실패:", response.statusText);
      }
    } catch (error) {
      alert(`에러 발생: ${error}`);
      console.error("에러 발생:", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>바코드 스캐너</h1>
      <p>바코드를 스캔하세요.</p>
      <input
        ref={inputRef}
        type="text"
        value={barcode}
        onChange={(e) => setBarcode(e.target.value)}
        style={{ opacity: 0, position: "absolute" }} // 사용자에게 숨김
      />
      <ul>
        {productList.map((product) => (
          <li key={product.productId}>
            <span>{product.name}</span>
            <br />
            <span>{product.price}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Cart;
