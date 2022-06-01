// const uploadFile= ()=>{
//     // .......
//     // .......
//     // .......
//     // .......
//     // .......
//     // .......
//     // .......
//     // .......
//     // .......
//     console.log("hi")  //3sec
// }

// const createUser= ()=>{    
//     // .......
//     // .......
//     // .......
//     // .......
//     // .......
//     // .......
//     // .......
//     // .......
//     uploadFile() //1sec
//     uploadFile() //1sec

//     console.log("Hello") //2sec
// }

// // O/P
// // hello
// // hi

// if ('1' == 1)
//     console.log("Hii");
// if ('1' === 1)
//     console.log("Hello");


//validating sizes to take multiple sizes at a single attempt.
// if (availableSizes) {
//     let sizesArray = availableSizes.split(",").map(x => x.trim())

//     for (let i = 0; i < sizesArray.length; i++) {
//         if (!(["S", "XS", "M", "X", "L", "XXL", "XL"].includes(sizesArray[i]))) {
//             return res.status(400).send({ status: false, message: "AvailableSizes should be among ['S','XS','M','X','L','XXL','XL']" })
//         }
//     }

//     //using array.isArray function to check the value is array or not.
//     if (Array.isArray(sizesArray)) {
//         newProductData['availableSizes'] = [...new Set(sizesArray)]
//     }
// }

const arr = [0, 1, 2, 3, 4]
// for(let i=0;i<arr.length;i++){   
//     arr[i]= arr[i]+1
// }
// console.log(arr)

const arr1 = arr.map(i => i * 2)   // [0,1,2,3,4].map([1,2,3,4,5], i=>i+1)
console.log(arr1)
console.log(arr)