"use client"

import { useState, useEffect, useRef } from "react"
import { formatDate } from "@/lib/dateUtils"
import { calculateRemainingTime, calculateWaitingPercentage } from "@/lib/progressClientUtils"
import {
  getProgress,
  updateCreateAccount,
  updateFirstListing,
  updateSellerAccount,
  updateCheckAccount,
} from "@/app/actions/progressActions"

export default function ProgressSignup({ accountId }) {
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [timeRemaining, setTimeRemaining] = useState({
    createAccount: null,
    firstListing: null,
    checkAccount: null,
  })
  const [percentages, setPercentages] = useState({
    createAccount: 0,
    firstListing: 0,
    checkAccount: 0,
  })
  const [recommendedTimes, setRecommendedTimes] = useState({
    firstListing: null,
    sellerAccount: null,
    checkAccount: null,
  })

  // Use refs to keep track of the latest progress data without triggering re-renders
  const progressRef = useRef(null)

  // Constants for waiting times
  const WAIT_TIMES = {
    createAccount: 3, // Hours
    firstListing: 3, // Hours
    sellerAccount: 2, // Hours
    checkAccount: 5 / 60, // 5 minutes in hours
  }

  // Fetch progress data
  const fetchProgress = async () => {
    try {
      setLoading(true)
      setError("")

      const result = await getProgress(accountId)

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch progress data")
      }

      // Update state and ref
      setProgress(result.data)
      progressRef.current = result.data

      // Calculate waiting times and percentages
      calculateTimes(result.data)
    } catch (err) {
      setError("Error fetching progress data: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Check if any waiting times have reached zero and might need a refresh
  const checkTimersFinished = (oldTimeRemaining, newTimeRemaining) => {
    // Check if any timer just reached zero
    if (
      (oldTimeRemaining.createAccount > 0 && newTimeRemaining.createAccount === 0) ||
      (oldTimeRemaining.firstListing > 0 && newTimeRemaining.firstListing === 0) ||
      (oldTimeRemaining.checkAccount > 0 && newTimeRemaining.checkAccount === 0)
    ) {
      // Play a notification sound (optional)
      try {
        const audio = new Audio('/notification.mp3'); // You'd need to add this file to your public folder
        audio.play().catch(e => console.log('Audio play failed:', e));
      } catch (e) {
        // Ignore audio errors
      }
      
      // Show a notification
      setSuccess("A waiting period has completed!");
    }
  }

  // Calculate waiting times and percentages
  const calculateTimes = (progressData) => {
    if (!progressData) return
    
    // Store old time remaining values to check for completed timers
    const oldTimeRemaining = { ...timeRemaining }

    // Create Account
    const createAccountRemaining = calculateRemainingTime(progressData.create_account_date, WAIT_TIMES.createAccount)

    // First Listing
    const firstListingRemaining = calculateRemainingTime(progressData.first_listing_date, WAIT_TIMES.firstListing)

    // Check Account
    const checkAccountRemaining = calculateRemainingTime(progressData.check_account_date, WAIT_TIMES.checkAccount)

    // Calculate recommended completion times
    const recommendedTimesObj = {}

    // Step 2: First Listing (3 hours after create_account)
    if (progressData.create_account_date) {
      const createDate = new Date(progressData.create_account_date)
      const recommendedFirstListingTime = new Date(createDate.getTime() + WAIT_TIMES.firstListing * 60 * 60 * 1000)

      // Calculate remaining time until recommended completion
      const now = new Date()
      const firstListingRemaining = Math.max(0, recommendedFirstListingTime.getTime() - now.getTime())

      recommendedTimesObj.firstListing = {
        date: recommendedFirstListingTime,
        remaining: firstListingRemaining,
        percentage: 100 - (firstListingRemaining / (WAIT_TIMES.firstListing * 60 * 60 * 1000)) * 100,
      }
    }

    // Step 3: Seller Account (2 hours after first_listing)
    if (progressData.first_listing_date) {
      const firstListingDate = new Date(progressData.first_listing_date)
      const recommendedSellerAccountTime = new Date(
        firstListingDate.getTime() + WAIT_TIMES.sellerAccount * 60 * 60 * 1000,
      )

      // Calculate remaining time until recommended completion
      const now = new Date()
      const sellerAccountRemaining = Math.max(0, recommendedSellerAccountTime.getTime() - now.getTime())

      recommendedTimesObj.sellerAccount = {
        date: recommendedSellerAccountTime,
        remaining: sellerAccountRemaining,
        percentage: 100 - (sellerAccountRemaining / (WAIT_TIMES.sellerAccount * 60 * 60 * 1000)) * 100,
      }
    }

    // Step 4: Check Account (5 minutes after seller_account)
    if (progressData.seller_account_date) {
      const sellerAccountDate = new Date(progressData.seller_account_date)
      const recommendedCheckAccountTime = new Date(
        sellerAccountDate.getTime() + WAIT_TIMES.checkAccount * 60 * 60 * 1000,
      )

      // Calculate remaining time until recommended completion
      const now = new Date()
      const checkAccountRemaining = Math.max(0, recommendedCheckAccountTime.getTime() - now.getTime())

      recommendedTimesObj.checkAccount = {
        date: recommendedCheckAccountTime,
        remaining: checkAccountRemaining,
        percentage: 100 - (checkAccountRemaining / (WAIT_TIMES.checkAccount * 60 * 60 * 1000)) * 100,
      }
    }

    setRecommendedTimes(recommendedTimesObj)

    const newTimeRemaining = {
      createAccount: createAccountRemaining,
      firstListing: firstListingRemaining,
      checkAccount: checkAccountRemaining,
    };
    
    // Check if any timers just reached zero
    checkTimersFinished(oldTimeRemaining, newTimeRemaining);
    
    setTimeRemaining(newTimeRemaining);

    // Calculate percentages
    setPercentages({
      createAccount: calculateWaitingPercentage(progressData.create_account_date, WAIT_TIMES.createAccount),
      firstListing: calculateWaitingPercentage(progressData.first_listing_date, WAIT_TIMES.firstListing),
      checkAccount: calculateWaitingPercentage(progressData.check_account_date, WAIT_TIMES.checkAccount),
    })
  }

  // Format remaining time as hours, minutes, seconds
  const formatRemainingTimeWithSeconds = (remainingMs) => {
    if (!remainingMs || remainingMs <= 0) return "Ready"

    const hours = Math.floor(remainingMs / (60 * 60 * 1000))
    const minutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000))
    const seconds = Math.floor((remainingMs % (60 * 1000)) / 1000)

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s remaining`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s remaining`
    } else {
      return `${seconds}s remaining`
    }
  }

  // Mark Create Account as completed
  const completeCreateAccount = async () => {
    try {
      setLoading(true)
      setError("")
      setSuccess("")

      const result = await updateCreateAccount(accountId, true)

      if (!result.success) {
        throw new Error(result.error || "Failed to update progress")
      }

      setProgress(result.data)
      progressRef.current = result.data
      calculateTimes(result.data)

      setSuccess("Successfully marked Create Account as completed")
    } catch (err) {
      setError("Error updating progress: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Mark First Listing as completed
  const completeFirstListing = async () => {
    try {
      setLoading(true)
      setError("")
      setSuccess("")

      const result = await updateFirstListing(accountId, true)

      if (!result.success) {
        throw new Error(result.error || "Failed to update progress")
      }

      setProgress(result.data)
      progressRef.current = result.data
      calculateTimes(result.data)

      setSuccess("Successfully marked First Listing as completed")
    } catch (err) {
      setError("Error updating progress: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Mark Seller Account as completed
  const completeSellerAccount = async () => {
    try {
      setLoading(true)
      setError("")
      setSuccess("")

      const result = await updateSellerAccount(accountId, true)

      if (!result.success) {
        throw new Error(result.error || "Failed to update progress")
      }

      setProgress(result.data)
      progressRef.current = result.data
      calculateTimes(result.data)

      setSuccess("Successfully marked Seller Account as completed")
    } catch (err) {
      setError("Error updating progress: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Mark Check Account as active
  const markAccountActive = async () => {
    try {
      setLoading(true)
      setError("")
      setSuccess("")

      const result = await updateCheckAccount(accountId, "active")

      if (!result.success) {
        throw new Error(result.error || "Failed to update progress")
      }

      setProgress(result.data)
      progressRef.current = result.data
      calculateTimes(result.data)

      setSuccess("Successfully marked account as Active")

      // Reload the page after a short delay to show updated account status
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (err) {
      setError("Error updating progress: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Mark Check Account as suspended
  const markAccountSuspended = async () => {
    try {
      setLoading(true)
      setError("")
      setSuccess("")

      const result = await updateCheckAccount(accountId, "suspended")

      if (!result.success) {
        throw new Error(result.error || "Failed to update progress")
      }

      setProgress(result.data)
      progressRef.current = result.data
      calculateTimes(result.data)

      setSuccess("Successfully marked account as Suspended")

      // Reload the page after a short delay to show updated account status
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (err) {
      setError("Error updating progress: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Manual refresh function that users can trigger if needed
  const refreshData = () => {
    fetchProgress()
  }

  // Update countdown timer every second without full data reload
  useEffect(() => {
    // Initial data fetch (only once when component mounts)
    fetchProgress()

    // Set up interval to update ONLY countdown timers and percentages every second
    const countdownIntervalId = setInterval(() => {
      if (progressRef.current) {
        calculateTimes(progressRef.current)
      }
    }, 1000)

    return () => {
      clearInterval(countdownIntervalId)
    }
  }, [accountId])

  // Clear success message after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess("")
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [success])

  if (loading && !progress) {
    return (
      <div className="bg-white rounded-lg shadow p-4 md:p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error && !progress) {
    return (
      <div className="bg-white rounded-lg shadow p-4 md:p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-xl font-semibold">Account Setup Progress</h2>
        <button 
          onClick={refreshData}
          className="mt-2 sm:mt-0 text-blue-600 hover:text-blue-800 text-sm flex items-center"
          disabled={loading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">{success}</div>
      )}

      <div className="space-y-6 md:space-y-8">
        {/* Step 1: Create Account */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                progress?.create_account_completed ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"
              }`}
            >
              1
            </div>
            <h3 className="text-lg font-medium">Create Account</h3>
          </div>

          <div className="ml-11 space-y-3">
            <p className="text-gray-600">Wait at least 3 hours after creating the account before proceeding.</p>

            {progress?.create_account_date && (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Started:</span> {formatDate(progress.create_account_date)}
                </p>

                {!progress.create_account_completed && (
                  <>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000"
                        style={{ width: `${percentages.createAccount}%` }}
                      ></div>
                    </div>

                    <p className="text-sm text-blue-600">
                      {formatRemainingTimeWithSeconds(timeRemaining.createAccount)}
                    </p>
                  </>
                )}
              </div>
            )}

            {!progress?.create_account_completed ? (
              <button
                onClick={completeCreateAccount}
                disabled={loading || (timeRemaining.createAccount !== null && timeRemaining.createAccount > 0)}
                className={`py-2 px-4 rounded-md ${
                  loading || (timeRemaining.createAccount !== null && timeRemaining.createAccount > 0)
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                Mark as Completed
              </button>
            ) : (
              <div className="py-2 px-4 bg-green-100 text-green-800 rounded-md inline-block">Completed ✓</div>
            )}
          </div>
        </div>

        {/* Step 2: First Listing */}
        <div
          className={`border rounded-lg p-4 ${
            progress?.create_account_completed ? "border-gray-200" : "border-gray-200 opacity-50"
          }`}
        >
          <div className="flex items-center mb-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                progress?.first_listing_completed
                  ? "bg-green-500 text-white"
                  : progress?.create_account_completed
                    ? "bg-gray-300 text-gray-600"
                    : "bg-gray-200 text-gray-400"
              }`}
            >
              2
            </div>
            <h3 className="text-lg font-medium">Add First Listing</h3>
          </div>

          <div className="ml-11 space-y-3">
            <p className="text-gray-600">
              Wait at least 3 hours after creating the account before adding your first listing.
            </p>

            {progress?.create_account_date && (
              <div className="space-y-2">
                {progress?.first_listing_date && (
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Started:</span> {formatDate(progress.first_listing_date)}
                  </p>
                )}

                {recommendedTimes.firstListing && (
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Recommended completion:</span>{" "}
                    {formatDate(recommendedTimes.firstListing.date)}
                  </p>
                )}

                {!progress.first_listing_completed && recommendedTimes.firstListing && (
                  <>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(recommendedTimes.firstListing.percentage, 100)}%` }}
                      ></div>
                    </div>

                    <p className="text-sm text-blue-600">
                      {recommendedTimes.firstListing.remaining > 0
                        ? formatRemainingTimeWithSeconds(recommendedTimes.firstListing.remaining)
                        : "Ready to complete"}
                    </p>
                  </>
                )}

                {/* Always show countdown even if first listing is completed but recommended time hasn't passed */}
                {progress.first_listing_completed &&
                  recommendedTimes.firstListing &&
                  recommendedTimes.firstListing.remaining > 0 && (
                    <div className="mt-2">

                    </div>
                  )}
              </div>
            )}

            {!progress?.first_listing_completed ? (
              <button
                onClick={completeFirstListing}
                disabled={loading || !progress?.create_account_completed}
                className={`py-2 px-4 rounded-md ${
                  loading || !progress?.create_account_completed
                    ? "bg-gray-300 cursor-not-allowed"
                    : recommendedTimes.firstListing && recommendedTimes.firstListing.remaining > 0
                      ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                {recommendedTimes.firstListing && recommendedTimes.firstListing.remaining > 0
                  ? "Mark as Complete (early)"
                  : "Mark as Complete"}
              </button>
            ) : (
              <div className="py-2 px-4 bg-green-100 text-green-800 rounded-md inline-block">Completed ✓</div>
            )}
          </div>
        </div>

        {/* Step 3: Seller Account */}
        <div
          className={`border rounded-lg p-4 ${
            progress?.first_listing_completed ? "border-gray-200" : "border-gray-200 opacity-50"
          }`}
        >
          <div className="flex items-center mb-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                progress?.seller_account_completed
                  ? "bg-green-500 text-white"
                  : progress?.first_listing_completed
                    ? "bg-gray-300 text-gray-600"
                    : "bg-gray-200 text-gray-400"
              }`}
            >
              3
            </div>
            <h3 className="text-lg font-medium">Create Seller Account</h3>
          </div>

          <div className="ml-11 space-y-3">
            <p className="text-gray-600">
              Wait at least 2 hours after adding your first listing before creating a seller account.
            </p>

            {progress?.first_listing_date && (
              <div className="space-y-2">
                {progress?.seller_account_date && (
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Completed:</span> {formatDate(progress.seller_account_date)}
                  </p>
                )}

                {recommendedTimes.sellerAccount && (
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Recommended completion:</span>{" "}
                    {formatDate(recommendedTimes.sellerAccount.date)}
                  </p>
                )}

                {!progress.seller_account_completed && recommendedTimes.sellerAccount && (
                  <>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(recommendedTimes.sellerAccount.percentage, 100)}%` }}
                      ></div>
                    </div>

                    <p className="text-sm text-blue-600">
                      {recommendedTimes.sellerAccount.remaining > 0
                        ? formatRemainingTimeWithSeconds(recommendedTimes.sellerAccount.remaining)
                        : "Ready to complete"}
                    </p>
                  </>
                )}

                {/* Always show countdown even if seller account is completed but recommended time hasn't passed */}
                {progress.seller_account_completed &&
                  recommendedTimes.sellerAccount &&
                  recommendedTimes.sellerAccount.remaining > 0 && (
                    <div className="mt-2">

                    </div>
                  )}
              </div>
            )}

            {!progress?.seller_account_completed ? (
              <button
                onClick={completeSellerAccount}
                disabled={loading || !progress?.first_listing_completed}
                className={`py-2 px-4 rounded-md ${
                  loading || !progress?.first_listing_completed
                    ? "bg-gray-300 cursor-not-allowed"
                    : recommendedTimes.sellerAccount && recommendedTimes.sellerAccount.remaining > 0
                      ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                {recommendedTimes.sellerAccount && recommendedTimes.sellerAccount.remaining > 0
                  ? "Mark as Complete (early)"
                  : "Mark as Complete"}
              </button>
            ) : (
              <div className="py-2 px-4 bg-green-100 text-green-800 rounded-md inline-block">Completed ✓</div>
            )}
          </div>
        </div>

        {/* Step 4: Check Account */}
        <div
          className={`border rounded-lg p-4 ${
            progress?.seller_account_completed ? "border-gray-200" : "border-gray-200 opacity-50"
          }`}
        >
          <div className="flex items-center mb-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                progress?.check_account_status === "active"
                  ? "bg-green-500 text-white"
                  : progress?.check_account_status === "suspended"
                    ? "bg-red-500 text-white"
                    : progress?.seller_account_completed
                      ? "bg-gray-300 text-gray-600"
                      : "bg-gray-200 text-gray-400"
              }`}
            >
              4
            </div>
            <h3 className="text-lg font-medium">Check Account</h3>
          </div>

          <div className="ml-11 space-y-3">
            <p className="text-gray-600">
              Wait at least 5 minutes after creating a seller account before checking the account.
            </p>

            {progress?.seller_account_date && (
              <div className="space-y-2">
                {progress?.check_account_date && progress?.check_account_status !== "pending" && (
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Reviewed:</span> {formatDate(progress.check_account_date)}
                  </p>
                )}

                {recommendedTimes.checkAccount && (
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Recommended review time:</span>{" "}
                    {formatDate(recommendedTimes.checkAccount.date)}
                  </p>
                )}

                {progress?.check_account_status === "pending" && recommendedTimes.checkAccount && (
                  <>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(recommendedTimes.checkAccount.percentage, 100)}%` }}
                      ></div>
                    </div>

                    <p className="text-sm text-blue-600">
                      {recommendedTimes.checkAccount.remaining > 0
                        ? formatRemainingTimeWithSeconds(recommendedTimes.checkAccount.remaining)
                        : "Ready to review"}
                    </p>
                  </>
                )}

                {/* Show note if account was reviewed early */}
                {(progress?.check_account_status === "active" || progress?.check_account_status === "suspended") &&
                  recommendedTimes.checkAccount &&
                  recommendedTimes.checkAccount.remaining > 0 && (
                    <div className="mt-2">

                    </div>
                  )}
              </div>
            )}

            {progress?.check_account_status === "active" && (
              <div className="py-2 px-4 bg-green-100 text-green-800 rounded-md inline-block">Account Active ✓</div>
            )}

            {progress?.check_account_status === "suspended" && (
              <div className="py-2 px-4 bg-red-100 text-red-800 rounded-md inline-block">Account Suspended ⚠</div>
            )}

            {progress?.seller_account_completed && progress?.check_account_status === "pending" && (
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={markAccountActive}
                  disabled={loading}
                  className={`py-2 px-4 rounded-md ${
                    loading
                      ? "bg-gray-300 cursor-not-allowed"
                      : recommendedTimes.checkAccount && recommendedTimes.checkAccount.remaining > 0
                        ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                        : "bg-green-500 hover:bg-green-600 text-white"
                  }`}
                >
                  {recommendedTimes.checkAccount && recommendedTimes.checkAccount.remaining > 0
                    ? "Mark as Active (early)"
                    : "Mark as Active"}
                </button>

                <button
                  onClick={markAccountSuspended}
                  disabled={loading}
                  className={`py-2 px-4 rounded-md ${
                    loading
                      ? "bg-gray-300 cursor-not-allowed"
                      : recommendedTimes.checkAccount && recommendedTimes.checkAccount.remaining > 0
                        ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                        : "bg-red-500 hover:bg-red-600 text-white"
                  }`}
                >
                  {recommendedTimes.checkAccount && recommendedTimes.checkAccount.remaining > 0
                    ? "Mark as Suspended (early)"
                    : "Mark as Suspended"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}