import React, { useEffect, useState, useRef } from 'react';
import Modal from 'react-modal';
import '../scss/Cart.scss';

const Cart = () => {
    const [isStart, setIsStart] = useState(false);
    const [barcode, setBarcode] = useState('');
    const [cartItemList, setCartItemList] = useState([]);
    const [productList, setProductList] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isWaiting, setIsWaiting] = useState(false);
    const inputRef = useRef(null);
    const wsCart = useRef(null);

    const SERVER_IP = '192.168.252.240';

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
                alert('최대 수량을 초과할 수 없습니다.');
                return prevCartItemList;
            }

            const updateList = [...prevCartItemList];
            updateList[existingItemIndex] = {
                ...existingItem,
                quantity: increasedItemQuantity,
            };

            return updateList;
        });
    };

    const decreaseItemQuantity = (itemId) => {
        const itemMaxQuantity = getItemMaxQuantity(itemId);
        console.log(itemMaxQuantity);
        setCartItemList((prevCartItemList) => {
            const existingItemIndex = prevCartItemList.findIndex((item) => item.id === itemId);
            const existingItem = prevCartItemList[existingItemIndex];
            const decreasedItemQuantity = existingItem.quantity - 1;
            if (decreasedItemQuantity === 0) {
                removeCartItem(itemId);
            }

            const updateList = [...prevCartItemList];
            updateList[existingItemIndex] = {
                ...existingItem,
                quantity: decreasedItemQuantity,
            };

            return updateList;
        });
    };

    const removeCartItem = (cartItemId) => {
        setCartItemList((prevCartItemList) => prevCartItemList.filter((item) => item.id !== cartItemId));
    };

    const sendBarcode = async (barcodeId) => {
        const product = productList.find((product) => product.barcode === barcodeId);
        if (!product) {
            alert('등록되지 않은 바코드 입니다.');
            return;
        }

        setCartItemList((prevCartItemList) => {
            const existingItemIndex = prevCartItemList.findIndex((item) => item.id === product.id);

            if (existingItemIndex !== -1) {
                const updateList = [...prevCartItemList];
                const existingItem = updateList[existingItemIndex];
                const itemMaxQuantity = getItemMaxQuantity(product.id);

                if (existingItem.quantity + 1 > itemMaxQuantity) {
                    alert('최대 수량을 초과할 수 없습니다.');
                    return prevCartItemList;
                }

                updateList[existingItemIndex] = {
                    ...existingItem,
                    quantity: existingItem.quantity + 1,
                };
                return updateList;
            } else {
                return [...prevCartItemList, { ...product, quantity: 1 }];
            }
        });
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedProduct({});
    };

    const handleSelectProduct = (product) => {
        setSelectedProduct(product);
    };

    const purchaseCartItmeList = async () => {
        if (cartItemList.length == 0) {
            alert('카트가 비어있습니다.');
            return;
        }
        const cartData = {
            cartId: '4bafc367',
            cartItemFormList: cartItemList.reduce((prevCartItemList, cartItem) => {
                return [
                    ...prevCartItemList,
                    {
                        productId: cartItem.id,
                        productQuantity: cartItem.quantity,
                    },
                ];
            }, []),
        };
        console.log(cartData);
        try {
            const res = await fetch(`http://${SERVER_IP}:8080/api/cart/purchase`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(cartData),
            });

            if (!res.ok) throw new Error(`HTTP 에러! ${res.status}`);

            const resData = await res.json();
            console.log(`결제 성공! ${resData}`);
            setIsWaiting(true);
        } catch (error) {
            console.log(`요청 전 에러! ${error}`);
        }
    };

    const maintainFocus = () => {
        if (inputRef.current && document.activeElement !== inputRef.current) {
            inputRef.current.focus(); // 포커스 유지
        }
    };

    const loadProductList = async () => {
        try {
            const response = await fetch(`http://${SERVER_IP}:8080/api/cart/productList`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setProductList(data.data);
                console.log(`제품 리스트 전송 성공: ${productList}`);
            } else {
                alert(`제품 리스트 전송 실패: ${response.statusText}`);
                console.log(`제품 리스트 전송 실패: ${response.statusText}`);
            }
        } catch (error) {
            alert(`제품 리스트 전송 에러 발생: ${error}`);
            console.error('제품 리스트 전송 에러 발생:', error);
        }
    };

    useEffect(() => {
        if (isStart) {
            // 페이지 로드 시 input에 자동 포커스
            inputRef.current.focus();

            const handleKeyPress = (e) => {
                if (e.key === 'Enter') {
                    // Enter 키 입력 시 바코드 처리 로직 실행
                    if (barcode.trim() !== '') {
                        sendBarcode(barcode);
                        setBarcode(''); // 입력 초기화
                    }
                }
            };

            window.addEventListener('keypress', handleKeyPress);
            return () => {
                window.removeEventListener('keypress', handleKeyPress);
            };
        }
    }, [isStart, barcode]);

    // useEffect(() => {
    //     if (isStart && Object.keys(cartItem).length !== 0) {
    //         const itemMaxQuantity = getItemMaxQuantity(cartItem.id);
    //         console.log(itemMaxQuantity);

    //         setCartItemList((prevCartItemList) => {
    //             const existingItemIndex = prevCartItemList.findIndex((item) => item.id === cartItem.id);

    //             if (existingItemIndex !== -1) {
    //                 const updateList = [...prevCartItemList];
    //                 const existingItem = updateList[existingItemIndex];
    //                 if (existingItem.quantity + 1 > itemMaxQuantity) {
    //                     alert('최대 수량을 초과할 수 없습니다.');
    //                     return prevCartItemList;
    //                 }
    //                 updateList[existingItemIndex] = {
    //                     ...updateList[existingItemIndex],
    //                     quantity: updateList[existingItemIndex].quantity + 1,
    //                 };
    //                 return updateList;
    //             } else {
    //                 return [
    //                     ...prevCartItemList,
    //                     {
    //                         ...cartItem,
    //                         quantity: 1,
    //                     },
    //                 ];
    //             }
    //         });
    //     }
    // }, [isStart, cartItem]);

    useEffect(() => {
        if (isStart) {
            loadProductList();
            maintainFocus();
            const loadProductListInterval = setInterval(loadProductList, 3000 * 1000);
            const focusInterval = setInterval(maintainFocus, 100); // 주기적으로 확인

            wsCart.current = new WebSocket(`ws://${SERVER_IP}:8080/ws/shopping?clientId=CLIENT_CART`);
            wsCart.current.onopen = () => console.log('WebSocket 연결 성공');
            wsCart.current.onmessage = (e) => {
                const message = JSON.parse(e.data);
                if (message.status === 'completed') {
                    alert('결제가 완료되었습니다.');
                    window.location.reload();
                }
            };

            wsCart.current.onclose = () => console.log('WebSocket 연결 종료');
            wsCart.current.onerror = (err) => console.error(`WebSocket 오류: ${err}`);

            return () => {
                if (wsCart.current) wsCart.current.close();
                clearInterval(loadProductListInterval);
                clearInterval(focusInterval);
            };
        }
    }, [isStart]);

    const handleStart = () => setIsStart(true);

    return (
        <div className='cart-container' onClick={handleStart}>
            {!isStart && (
                <div className='start-section'>
                    <div className='text-container'>
                        <div className='top-text-container'>
                            <span className='top-text'>셀프 계산</span>
                        </div>
                        <div className='bottom-text-container'>
                            <div className='bottom-left-text-container'>
                                <span className='bottom-left-text'>시작하기</span>
                            </div>
                            <div className='bottom-right-text-container'>
                                <span>화면을</span>
                                <span>터치해주세요</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {isStart && isWaiting && (
                <div>
                    <p>결제 대기 중 입니다.</p>
                    <p>계산대로 이동해 주세요.</p>
                </div>
            )}
            {isStart && !isWaiting && (
                <div className='scan-section'>
                    <input
                        ref={inputRef}
                        type='text'
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        style={{
                            opacity: 100,
                            position: 'absolute',
                        }}
                    />
                    <Modal
                        isOpen={isModalOpen}
                        onRequestClose={closeModal}
                        className='customModal'
                        overlayClassName='customOverlay'
                    >
                        <div className='modal-container'>
                            <div className='product-name-list-container'>
                                <ul>
                                    {productList.map((product) => (
                                        <li
                                            className='product-name-container'
                                            tabIndex={0}
                                            key={product.id}
                                            onClick={() => handleSelectProduct(product)}
                                        >
                                            <span>{product.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className='product-info-container'>
                                {Object.keys(selectedProduct).length !== 0 && (
                                    <div className='product-info'>
                                        <span className='dummy-image'></span>
                                        <span className='product-name'>{selectedProduct.name}</span>
                                        <div className='product-info-field-container'>
                                            <span className='product-info-field'>가격 |</span>
                                            <span
                                                className='product-info-value
                                                '
                                            >
                                                {selectedProduct.price}원
                                            </span>
                                            <span className='product-info-field'>재고 |</span>
                                            <span
                                                className='product-info-value
                                                '
                                            >
                                                {selectedProduct.quantity}개 이하
                                            </span>
                                            <span className='product-info-field'>위치 |</span>
                                            <span
                                                className='product-info-value
                                                '
                                            >
                                                {selectedProduct.location}번 진열대
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Modal>
                    <div className='guide-section'>
                        <div className='guide-text-container'>
                            <span>상품의 바코드를</span>
                            <span>스캔해주세요.</span>
                        </div>
                        <div className='product-list-modal-button' onClick={openModal}>
                            <span>상품조회</span>
                        </div>
                    </div>
                    <div className='control-section'>
                        <ul className='cart-item-list'>
                            {cartItemList.map((cartItem) => (
                                <li className='cart-item' key={cartItem.id}>
                                    <span
                                        style={{
                                            display: 'block',
                                        }}
                                    >
                                        {cartItem.name}
                                    </span>
                                    <span
                                        style={{
                                            display: 'block',
                                        }}
                                    >
                                        {cartItem.quantity}개
                                    </span>
                                    <div className='cart-item-button-container'>
                                        <button onClick={() => increaseItemQuantity(cartItem.id)}>+</button>
                                        <button onClick={() => decreaseItemQuantity(cartItem.id)}>-</button>
                                    </div>
                                    <span>{cartItem.quantity * cartItem.price}원</span>
                                    <button onClick={() => removeCartItem(cartItem.id)}>X</button>
                                </li>
                            ))}
                        </ul>

                        <div className='summary-container'>
                            <div className='summary'>
                                <span>총 수량</span>
                                <span>
                                    {cartItemList.reduce(
                                        (totalQuantity, cartItem) => (totalQuantity += cartItem.quantity),
                                        0
                                    )}
                                    개
                                </span>
                            </div>
                            <div className='summary'>
                                <span>총 결제금액</span>
                                <span>
                                    {cartItemList.reduce(
                                        (totalPrice, cartItem) => (totalPrice += cartItem.quantity * cartItem.price),
                                        0
                                    )}
                                    원
                                </span>
                            </div>
                        </div>

                        <div className='payment-button-container'>
                            <button className='payment-button' onClick={purchaseCartItmeList}>
                                결제
                            </button>
                            <button className='cancel-button' onClick={() => window.location.reload()}>
                                처음으로
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
