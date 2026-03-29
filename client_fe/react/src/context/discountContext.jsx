import discountApi from "../api/discountApi"
import { createContext, useState, useEffect, useContext } from "react"

export const DiscountContext = createContext()

export const DiscountProvider = ({ children }) => {
    // Lưu trữ các object map cho phép truy xuất nhanh % giảm giá theo gamesId hoặc categoriesId
    const [discountMap, setDiscountMap] = useState({ games: {}, categories: {} })

    const getAllDiscount = async () => {
        try {
            const response = await discountApi.getAllDiscount()
            const data = await response.json()
            const discountList = Array.isArray(data) ? data : data?.data || data?.elements || []

            const gameDiscounts = {}
            const categoryDiscounts = {}

            // Tạo map từ danh sách discount
            discountList.forEach(sale => {
                if (sale.isActive) {
                    if (Array.isArray(sale.categoriesId)) {
                        sale.categoriesId.forEach(id => {
                            categoryDiscounts[id] = Math.max(categoryDiscounts[id] || 0, sale.discount)
                        })
                    }
                    if (Array.isArray(sale.gamesId)) {
                        sale.gamesId.forEach(id => {
                            gameDiscounts[id] = Math.max(gameDiscounts[id] || 0, sale.discount)
                        })
                    }
                }
            })

            const resultMap = { games: gameDiscounts, categories: categoryDiscounts }
            // console.log(resultMap)
            setDiscountMap(resultMap)
            return resultMap
        } catch (error) {
            // console.log(error)
        }
    }

    useEffect(() => {
        getAllDiscount()
    }, [])

    return (
        <DiscountContext.Provider value={{ getAllDiscount, discountMap }}>
            {children}
        </DiscountContext.Provider>
    )
}