import Head from 'next/head'
import { Inter } from '@next/font/google'
import styles from '../styles/Home.module.css'
import { useEffect, useState, useRef } from 'react'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const inputRef = useRef(null)
  const [prevDeliveryCount, setPrevDeliveryCount] = useState(0);
  const generateMultiple = useRef(false)
  const [box, setBox] = useState("")
  const [singlesWeighting, setSinglesWeighting] = useState(4)
  const [couplesWeighting, setCouplesWeighting] = useState(3)
  const [familiesWeighting, setFamiliesWeighting] = useState(2)
  const [lgFamiliesWeighting, setLgFamiliesWeighting] = useState(1)
  const [referralCount, setReferralCount] = useState(0)
  const [totalReferralCount, setTotalReferralCount] = useState(0)
  const [allReferralCounts, setAllReferralCounts] = useState([])
  const [deliveryCount, setDeliveryCount] = useState(0)
  const [minReferralCount, setMinReferralCount] = useState(null)
  const [maxReferralCount, setMaxReferralCount] = useState(0)
  const [maxOutOfDateBy, setMaxOutOfDateBy] = useState(0)
  const [minExpiryDate, setMinExpiryDate] = useState(0)
  const [maxExpiryDate, setMaxExpiryDate] = useState(31)
  const [maxStockValues, setMaxStockValues] = useState([0, 0, 0, 0]) //singles, couples, families, large families
  const [foodBoxStock, setFoodBoxStock] = useState({
    "single": [],
    "couple": [],
    "family": [],
    "large family": []
  })

  const handleSliderChange = (event, type) => {
    // "singles weighting"
    if (type === "singles weighting") setSinglesWeighting(event.target.value)
    if (type === "couples weighting") setCouplesWeighting(event.target.value)
    if (type === "families weighting") setFamiliesWeighting(event.target.value)
    if (type === "lg families weighting") setLgFamiliesWeighting(event.target.value)

    if (type === "singles restock") 
      {
        let _maxStockValues = [...maxStockValues]
        _maxStockValues[0] = event.target.value
        setMaxStockValues(_maxStockValues)
      }
    if (type === "couples restock") {
      let _maxStockValues = [...maxStockValues]
      _maxStockValues[1] = event.target.value
      setMaxStockValues(_maxStockValues)
    }
    if (type === "families restock") {
      let _maxStockValues = [...maxStockValues]
        _maxStockValues[2] = event.target.value
        setMaxStockValues(_maxStockValues)
    }
    if (type === "lg families restock") {
      let _maxStockValues = [...maxStockValues]
      _maxStockValues[3] = event.target.value
      setMaxStockValues(_maxStockValues)
    }

    if (type === "min expiry date") setMinExpiryDate(event.target.value)
    if (type === "max expiry date") setMaxExpiryDate(event.target.value)
  }

  function generateRndWeighting() {
    let _weightings = []
    for (let i=0; i < singlesWeighting; i++) {
      _weightings.push(0)
    }
    for (let i=0; i < couplesWeighting; i++) {
      _weightings.push(1)
    }
    for (let i=0; i < familiesWeighting; i++) {
      _weightings.push(2)
    }
    for (let i=0; i < lgFamiliesWeighting; i++) {
      _weightings.push(3)
    }
    return _weightings
  }

  function getRandomInt(max) {
    const _weightedArr = generateRndWeighting()
    return _weightedArr[Math.floor(Math.random()*10)];
  }

  function getRandomExpiry(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
  }
  
  const boxMapping = ["single", "couple", "family", "large family"]

  const createBox = (kind) => {
    const _newBox = {
      "kind": kind,
      "expires": getRandomExpiry(minExpiryDate, maxExpiryDate)
    }
    return _newBox
  }

  const incrementBBE = (foodStock) => {
    for (let stock in foodStock) {
      for (let item of foodStock[stock]) {
        item.expires -= 1
        if (item.expires < 0) {
          if (1 - item.expires > maxOutOfDateBy) {
            setMaxOutOfDateBy(1 - item.expires)
          }
        }
      }
    }
    return foodStock
  }

  const generateBoxReferral = () => {
    if (maxStockValues[0] > 0 &&
      maxStockValues[1] > 0 &&
      maxStockValues[2] > 0 &&
      maxStockValues[3] > 0) {

        const _newBoxReferral =  boxMapping[getRandomInt(4)].toString()
        setBox(_newBoxReferral)
       
        let _referralCount = referralCount + 1
        let _totalReferralCount = totalReferralCount + 1
        setReferralCount(_referralCount)
        setTotalReferralCount(_totalReferralCount)
    
        let _foodboxStock = incrementBBE({...foodBoxStock})
    
        if (_foodboxStock[_newBoxReferral].length > 0) {
          _foodboxStock[_newBoxReferral].sort(function (a, b) {
            return a.expires - b.expires
          }).shift()
        }
        return setFoodBoxStock({
          ..._foodboxStock
        })
      }

      return
    
  }

  const clickGenerate = () => {
      inputRef.current.click()
    return
  }

  const reStock = () => {
    const _foodboxStock = foodBoxStock
    for (let index in maxStockValues) {
      let _kind = Object.keys(_foodboxStock)[index]
      let _numberOfBoxesToAdd = maxStockValues[index] - _foodboxStock[_kind].length
      for (let i = 0; i < _numberOfBoxesToAdd; i++) {
        _foodboxStock[_kind].push(createBox(_kind))
      }
    }

    if (!minReferralCount || referralCount < minReferralCount) {
      setMinReferralCount(referralCount)
    }

    if (referralCount > maxReferralCount) {
      setMaxReferralCount(referralCount)
    }

    const _allReferralCounts = allReferralCounts
    _allReferralCounts.push(referralCount)
    setAllReferralCounts(_allReferralCounts)
    const _deliveryCount = parseInt(deliveryCount) + 1
    setDeliveryCount(_deliveryCount)

    setReferralCount(0)

    setFoodBoxStock({
      ..._foodboxStock
    })
  
    return
  }
  
  const getAverageNoOfReferrals = (referralCounts) => {
    return (referralCounts.reduce((partialSum, a) => partialSum + a, 0) / referralCounts.length).toFixed(2)
  }

  const generateThousand = () => {
    // setMinReferralCount(null)
    // setMaxReferralCount(0)
    // setAllReferralCounts([])
    setPrevDeliveryCount(deliveryCount)
    generateMultiple.current = true
  }
 

  useEffect(() => {
    if ((foodBoxStock.single.length === 0 || foodBoxStock.couple.length === 0 || foodBoxStock.family.length === 0 || foodBoxStock["large family"].length === 0) && (
      maxStockValues[0] > 0 &&
      maxStockValues[1] > 0 &&
      maxStockValues[2] > 0 &&
      maxStockValues[3] > 0
    )) {
      reStock()
    }
    if (generateMultiple.current == true && 
      ((prevDeliveryCount < 2 && deliveryCount < (prevDeliveryCount + 999)) || (prevDeliveryCount > 999 && deliveryCount < (prevDeliveryCount + 1000)))
    ) {
      const timeout = setTimeout(() => {
        clickGenerate()
      }, 5)
  
      return () => {
        clearTimeout(timeout)
      }
    } else generateMultiple.current = false
    
  }, [
    foodBoxStock, 
    box, 
    referralCount, 
    totalReferralCount, 
    minReferralCount, 
    maxReferralCount, 
    allReferralCounts, 
    deliveryCount, 
    generateMultiple, 
    prevDeliveryCount,
    singlesWeighting,
    couplesWeighting,
    familiesWeighting,
    lgFamiliesWeighting
  ])

  return (
    <>
      <Head>
        <title>Foodbank Distribution</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className={styles.description}>
          Foodbank Distribution Centre Monte Carlo Simulation 
        </div>
        <div>
          <div className={styles.infoBar}>
            <div><h2>REFERRAL TYPE</h2>
              {box==="single" && <div className={styles.singleBox}/>}
              {box==="couple" && <div className={styles.coupleBox}/>}
              {box==="family" && <div className={styles.familyBox}/>}
              {box==="large family" && <div className={styles.lgFamilyBox}/>}
            </div>
            <div><h2>REFS THIS DELIVERY</h2> {referralCount}</div>
            <div><h2>TOTAL REF COUNT</h2> {totalReferralCount}</div>
            <div><h2>DELIVERY COUNT</h2> {deliveryCount}</div>
            <div><h2>MIN REF COUNT</h2><p>{minReferralCount}</p><h2>MAX REF COUNT</h2><p>{maxReferralCount}</p></div>
            <div><h2>MAX OUT OF DATE BY</h2> {maxOutOfDateBy}</div>
            <div className={styles.maximise}><h2>AVG REF COUNT</h2> {getAverageNoOfReferrals(allReferralCounts)}</div>
          </div>
          <div className={styles.remainingBoxes}>
            <div>{foodBoxStock["single"].map(box => {
              return <div className={styles.single}>{box.kind} bbe {box.expires}</div>
            })}</div>
            <div>{foodBoxStock["couple"].map(box => {
              return <div className={styles.couple}>{box.kind} bbe {box.expires}</div>
            })}</div>
            <div>{foodBoxStock["family"].map(box => {
              return <div className={styles.family}>{box.kind} bbe {box.expires}</div>
            })}</div>
            <div>{foodBoxStock["large family"].map(box => {
              return <div className={styles.lgFamily}>{box.kind} bbe {box.expires}</div>
            })}</div>
          </div>
        </div>
        <div className={styles.slideContainerCols}>
            <div className={styles.slideContainer}>
              <div><h4>SINGLES WEIGHTING</h4><input type="range" min="0" max="10" value={singlesWeighting} onChange={event => handleSliderChange(event, "singles weighting")} id="singlesRange"/>{singlesWeighting}/10</div>
              <div><h4>COUPLES WEIGHTING</h4><input type="range" min="0" max="10" value={couplesWeighting} onChange={event => handleSliderChange(event, "couples weighting")} id="couplesRange"/>{couplesWeighting}/10</div>
              <div><h4>FAMILIES WEIGHTING</h4><input type="range" min="0" max="10" value={familiesWeighting} onChange={event => handleSliderChange(event, "families weighting")} id="familiesRange"/>{familiesWeighting}/10</div>
              <div><h4>LG FAMILIES WEIGHTING</h4><input type="range" min="0" max="10" value={lgFamiliesWeighting} onChange={event => handleSliderChange(event, "lg families weighting")} id="lgFamiliesRange"/>{lgFamiliesWeighting}/10</div>
            </div>
            <div className={styles.slideContainer}>
              <div><h4>SINGLES RESTOCK</h4><input type="range" min="0" max="12" value={maxStockValues[0]} onChange={event => handleSliderChange(event, "singles restock")} id="singlesRestock"/>{maxStockValues[0]}/12</div>
              <div><h4>COUPLES RESTOCK</h4><input type="range" min="0" max="12" value={maxStockValues[1]} onChange={event => handleSliderChange(event, "couples restock")} id="couplesRestock"/>{maxStockValues[1]}/12</div>
              <div><h4>FAMILIES RESTOCK</h4><input type="range" min="0" max="12" value={maxStockValues[2]} onChange={event => handleSliderChange(event, "families restock")} id="familiesRestock"/>{maxStockValues[2]}/12</div>
              <div><h4>LG FAMILIES RESTOCK</h4><input type="range" min="0" max="12" value={maxStockValues[3]} onChange={event => handleSliderChange(event, "lg families restock")} id="lgFamiliesRestock"/>{maxStockValues[3]}/12</div>
            </div>
            <div className={styles.slideContainer}>
              <div><h4>MIN EXPIRY DATE</h4><input type="range" min="0" max="31" value={minExpiryDate} onChange={event => handleSliderChange(event, "min expiry date")} id="minExpiryDateRange"/>{minExpiryDate}</div>
              <div><h4>MAX EXPIRY DATE</h4><input type="range" min="0" max="62" value={maxExpiryDate} onChange={event => handleSliderChange(event, "max expiry date")} id="maxExpiryDateRange"/>{maxExpiryDate}</div>
            </div>
          </div>
        <button ref={inputRef} className={styles.generateReferralButton} onClick={() => generateBoxReferral()}>Generate 1 referral</button>
        <button disabled={deliveryCount < 1} className={styles.generateTenThousandReferralButton} onClick={() => generateThousand()}>Generate 1000 deliveries</button>
        
      </main>
    </>
  )
}
