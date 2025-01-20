"use server"

export async function submitLeaveApplication(formData: FormData) {
  // Simulate a delay to mimic server processing
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Log the form data (in a real app, you'd save this to a database)
  console.log("Leave application submitted:", Object.fromEntries(formData))

  // Return a success message
  return { message: "Leave application submitted successfully" }
}

