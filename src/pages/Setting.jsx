import React, { useState, useEffect } from "react";

const Setting = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 상품 목록을 가져오는 함수
  const fetchProducts = async () => {
    try {
      const response = await fetch(
        "http://192.168.170.240:8080/api/cart/productList",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("상품 목록을 가져오는 데 실패했습니다.");
      }

      const data = await response.json();
      setProducts(data.data); // 데이터가 `resWrapper.data`에 있음
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetting = async () => {
    try {
      const res = await fetch("http://192.168.170.240:8080/api/setting/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const result = await res.json();
        console.log("데이터 초기화 성공!", result);
        alert("DB 초기화 성공!");
      } else {
        console.error("데이터 초기화 실패!");
        alert("DB 초기화 실패!");
      }
    } catch (err) {
      console.error("API 호출 오류", err);
      alert("서버 오류가 발생했습니다!");
    }
  };

  // 컴포넌트가 마운트될 때 상품 목록을 가져옴
  useEffect(() => {
    fetchProducts();
  }, [products]);

  return (
    <div>
      <h1>Setting Page</h1>
      <button onClick={handleSetting}>DB 초기화 버튼</button>
      <h1>상품 목록</h1>
      {loading && <p>로딩 중...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {products.map((product) => (
          <li key={product.barcode}>
            {product.name} - {product.price}원 ({product.quantity}개)
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Setting;
