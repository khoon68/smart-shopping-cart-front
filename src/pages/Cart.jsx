import { useEffect, useState, useRef } from "react";

const Cart = () => {
  const [isStart, setIsStart] = useState(false);
  const [barcode, setBarcode] = useState(""); // 입력된 바코드
  const [cartItemList, setCartItemList] = useState([]);
  const [cartItem, setCartItem] = useState({});
  const [product, setProduct] = useState({});
  const [productList, setProductList] = useState([]);
  const [isWaiting, setIsWaiting] = useState(false);
  const inputRef = useRef(null); // input 요소 참조
  const wsCart = useRef(null);

  const SERVER_IP = "192.168.67.240";

  const resetCart = () => {
    setBarcode("");
    setCartItemList([]);
    setCartItem({});
    setProduct({});
    setProductList([]);
    setIsWaiting(false);
    setIsStart(false);
  };

  const getItemMaxQuantity = (itemId) => {
    const result = productList.find((product) => product.id === itemId);
    console.log(result.quantity);
    if (!result) return null;
    else return result.quantity;
  };
  

  const increaseItemQuantity = (itemId) => {
    const itemMaxQuantity = getItemMaxQuantity(itemId);
    console.log(itemMaxQuantity);
    setCartItemList((prevCartItemList) => {
      const existingItemIndex = prevCartItemList.findIndex((item) => item.id === itemId);
      const existingItem = prevCartItemList[existingItemIndex];
      const increasedItemQuantity = existingItem.quantity + 1;
      if (increasedItemQuantity > itemMaxQuantity) {
        alert("최대 수량을 초과할 수 없습니다.");
        return prevCartItemList;
      }

      const updateList = [...prevCartItemList];
      updateList[existingItemIndex] = {
        ...existingItem,
        quantity: increasedItemQuantity
      };

      return updateList;
    });
  }

  const decreaseItemQuantity = (itemId) => {
    const itemMaxQuantity = getItemMaxQuantity(itemId);
    console.log(itemMaxQuantity);
    setCartItemList((prevCartItemList) => {
      const existingItemIndex = prevCartItemList.findIndex((item) => item.id === itemId);
      const existingItem = prevCartItemList[existingItemIndex];
      const decreasedItemQuantity = existingItem.quantity - 1;
      if (decreasedItemQuantity === 0) {
        return prevCartItemList.filter((item) => item.id !== itemId);
      }

      const updateList = [...prevCartItemList];
      updateList[existingItemIndex] = {
        ...existingItem,
        quantity: decreasedItemQuantity
      };

      return updateList;
    });
  }

  const purchaseCartItmeList = async () => {
    if (Object.keys(cartItem).length == 0) {
      alert('카트가 비어있습니다.');
      return;
    }
    const cartData = {
      cartId: "4bafc367",
      cartItemFormList: cartItemList.reduce((prevCartItemList, cartItem) => {
        return [
          ...prevCartItemList,
          {
            productId: cartItem.id,
            productQuantity: cartItem.quantity
          }
        ];
      }, [])
    };
    console.log(cartData);
    try {
      const res = await fetch(
        `http://${SERVER_IP}:8080/api/cart/purchase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cartData)
      });

      if (!res.ok) throw new Error (`HTTP 에러! ${res.status}`);

      const resData = await res.json();
      console.log(`결제 성공! ${resData}`);
      setIsWaiting(true);
    } catch (error) {
      console.log(`요청 전 에러! ${error}`);
    }
  }

  const maintainFocus = () => {
    if (inputRef.current && document.activeElement !== inputRef.current) {
      inputRef.current.focus(); // 포커스 유지
    }
  };

  const loadProductList = async () => {
    try {
      const response = await fetch(
        `http://${SERVER_IP}:8080/api/cart/productList`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      if(response.ok) {
        const data = await response.json();
        setProductList(data.data);
        console.log(`제품 리스트 전송 성공: ${productList}`);
      } else {
        alert(`제품 리스트 전송 실패: ${response.statusText}`);
        console.log(`제품 리스트 전송 실패: ${response.statusText}`);
      }
    } catch (error) {
      alert(`제품 리스트 전송 에러 발생: ${error}`);
      console.error("제품 리스트 전송 에러 발생:", error);
    }
  }

  useEffect(() => {
    if (isStart) {
      // 페이지 로드 시 input에 자동 포커스
    inputRef.current.focus();

    const handleKeyPress = (e) => {
      if (e.key === "Enter") {
        // Enter 키 입력 시 바코드 처리 로직 실행
        if (barcode.trim() !== "") {
          sendBarcode(barcode);
          setBarcode(""); // 입력 초기화
        }
      }
    };

    window.addEventListener("keypress", handleKeyPress);
    return () => {
      window.removeEventListener("keypress", handleKeyPress);
    };
    }
  }, [isStart, barcode]);

  useEffect(() => {
    if (isStart && Object.keys(cartItem).length !== 0) {

      const itemMaxQuantity = getItemMaxQuantity(cartItem.id);
      console.log(itemMaxQuantity);

      setCartItemList((prevCartItemList) => {
        const existingItemIndex = prevCartItemList.findIndex(
          (item) => item.id === cartItem.id
        );

        if (existingItemIndex !== -1) {
          const updateList = [...prevCartItemList];
          const exsitingItem = updateList[existingItemIndex]; 
          if(exsitingItem.quantity + 1 > itemMaxQuantity) {
            alert("최대 수량을 초과할 수 없습니다.");
            return prevCartItemList;
          }
          updateList[existingItemIndex] = {
            ...updateList[existingItemIndex],
            quantity: updateList[existingItemIndex].quantity + 1
          };
          return updateList;
        } else {
          return [
            ...prevCartItemList,
            {
              ...cartItem,
              quantity: 1
            }
          ];
        }
      });
    }
  }, [isStart, cartItem]);

  useEffect(() => {
    if(isStart) {
      loadProductList();
      maintainFocus();
      // const loadProductListInterval = setInterval(loadProductList, 3000 * 1000);
      const focusInterval = setInterval(maintainFocus, 100); // 주기적으로 확인

      wsCart.current = new WebSocket(`ws://${SERVER_IP}:8080/ws/shopping?clientId=CLIENT_CART`);
      wsCart.current.onopen = () => console.log("WebSocket 연결 성공");
      wsCart.current.onmessage = (e) => {
        const message = JSON.parse(e.data);
        if (message.status === "completed") {
          alert("결제가 완료되었습니다.");
          window.location.reload();
        }
      };

      wsCart.current.onclose = () => console.log("WebSocket 연결 종료");
      wsCart.current.onerror = (err) => console.error(`WebSocket 오류: ${err}`);

      return () => {
        if (wsCart.current) wsCart.current.close();
        // clearInterval(loadProductListInterval);
        clearInterval(focusInterval);
      } // 클린업
    }
  }, [isStart]);

  const sendBarcode = async (barcodeId) => {
    const product = productList.find((product) => product.barcode === barcodeId);
    if (Object.keys(product).length === 0) {
      alert("등록되지 않은 바코드 입니다.");
      return;
    }
    setCartItem(product);
  };

  
 
  const handleStart = () => setIsStart(true);

  return (
    <div onClick={handleStart} style={{ border: "dashed red",  padding: "20px" }}>
      <h1>카트 페이지</h1>
      {!isStart && (
        <div>
          <p>셀프 계산</p>
          <p>
            <span>시작하기</span>
            <br />
              <span>화면을</span>
              <span>터치해주세요</span>
          </p>
        </div>
      )}
      {(isStart && isWaiting) && (
        <div>
          <p>결제 대기 중 입니다.</p>
          <p>계산대로 이동해 주세요.</p>
        </div>
      )}
      {(isStart && !isWaiting) && (
        <div>
          <p>바코드를 스캔하세요.</p>
        <input
          ref={inputRef}
          type="text"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          style={{ opacity: 0, position: "absolute" }} // 사용자에게 숨김
        />
        <ul>
          {cartItemList.map((cartItem) => (
            <li style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "10px",
              fontSize: "14px"
              }} key={cartItem.id}>
              <span style={{display: "block"}}>{cartItem.name}</span>
              <span style={{display: "block"}}>{cartItem.quantity}</span>
              <span style={{display: "block"}}>{cartItem.quantity * cartItem.price}원</span>
              <div className="button-container">
                <button onClick={() => increaseItemQuantity(cartItem.id)}>+</button>
                <button onClick={() => decreaseItemQuantity(cartItem.id)}>-</button>
              </div>
            </li>
          ))}
        </ul>
          <button onClick={purchaseCartItmeList} >결제</button>
        </div>
      )}
    </div>
  );
};

export default Cart;
