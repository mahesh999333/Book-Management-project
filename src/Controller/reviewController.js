const reviewModel = require('../Models/reviewModel')
const {isValidRequest, isValidName, isValid} = require('../Validator/userValidation')
const {isValidId} = require('../Validator/bookValidation')
const bookModel = require('../Models/bookModel')
const {isValidRating} = require('../Validator/reviewValidation')

// ---------------------------------------Create Review----------------------------------
const createReview = async function(req, res){
    try{

        //validating the body part if the body is empty
        if(!isValidRequest(req.body)){
            return res
                .status(400)
                .send({status:false, message:"Enter a valid Input"})
        }

        let { reviewedBy, rating, review} = req.body
        let data = {}
        let Id = req.params.bookId

        //Id validation
        if(!isValidId(Id)){
            return res
            .status(400)
            .send({status:false, message:"Give a valid book id in url"})
        }

        //finding book with bookId
        const book = await bookModel.findOne({_id: Id, isDeleted:false})
        if(!book){
            return res
            .status(404)
            .send({status:false, message:"No book found or is already deleted"})
        }
       
        //validation of reviewer's name
        if(reviewedBy){
            if(!isValidName(reviewedBy)){
                return res
                    .status(400)
                    .send({status:false, message:"Enter a valid Name"})
            }else data.reviewedBy = reviewedBy
        }
        
        //validation of rating
        if(rating && typeof rating !== "string"){
            if(!isValidRating(rating)){
                return res
                    .status(400)
                    .send({status:false, message:"Enter a valid Rating"})
            }else data.rating = rating
        }else{
            return res
            .status(400)
            .send({status:false, message:"Rating is required and will be number between 1 to 5"})
        }

        //validation of review
        if(review){
            if(!isValid(review)){
                return res
                    .status(400)
                    .send({status:false, message:"Enter a valid Review"})
            }else data.review = review.trim()
        }

        //adding reviewedAt date key and bookId key from code and not from body
        data.reviewedAt = Date.now()
        data.bookId = Id

        //creating review
        const bookReview = await reviewModel.create(data)
        //updating the book document by increasing the number of reviews
        const finalBook = await bookModel.findOneAndUpdate({_id:book._id},{$inc:{reviews: 1}},{new:true}).select({__v:0})
        
        //getting updated bookdata along with the review created
        finalBook._doc["reviewsData"] = bookReview

        return res
            .status(201)
            .send({status:true, message:"Successful", data:finalBook})
    }
    catch(error){
        return res
                .status(500)
                .send({status: false, message: error.message})
    }
}


//------------------------------------------------Update Review-------------------------------------------
const updateReview = async function(req, res){
    try{

        //validating the body part if the body is empty
        if(!isValidRequest(req.body)){
            return res
                .status(400)
                .send({status:false, message:"Enter a valid Input"})
        }

        let {review, rating, reviewedBy} = req.body 
        let bookId = req.params.bookId
        let reviewId = req.params.reviewId
        
        // validation of bookId and reviewId
        if(!isValidId(bookId) || !isValidId(reviewId)){
            return res
                .status(400)
                .send({status:false, message:"Enter valid bookId or reviewId"})
        }

        //validation of review if present
        if(review != undefined){
            review = review.trim()
            if(!isValid(review)){
                return res
                    .status(400)
                    .send({status:false, message:"Enter valid review"})
            }
        }

        //validation of rating if present
        if(rating != undefined){
            if(typeof rating === "string" || !isValidRating(rating)){
                return res
                    .status(400)
                    .send({status:false, message:"Enter valid rating"})
            }
        }

        //validation of reviewer's name if present
        if(reviewedBy != undefined){
            reviewedBy = reviewedBy.trim()
            if(!isValidName(reviewedBy)){
                return res
                    .status(400)
                    .send({status:false, message:"Enter a valid Name"})
            }
        }

        //finding respective book
        let book = await bookModel.findOne({_id: bookId, isDeleted:false})
        if(!book){
            return res
                .status(404)
                .send({status:false, message:"Book not found or is deleted"})
        }

        // updating review data
        const bookReview = await reviewModel.findOneAndUpdate({_id: reviewId, bookId: bookId, isDeletd:false},{$set:{review:review, rating: rating, reviewedBy:reviewedBy}},{new: true})

        if(!bookReview){
            return res
                .status(404)
                .send({status:false, message:"Review not found or is not for given bookId in url"})
        }
       
        // displaying bookdata along with the updated review
        book._doc["reviewsData"] = bookReview

        return res
            .status(200)
            .send({status: true, message:"Books list", data: book})

    }
    catch(error){
        return res
            .status(500)
            .send({status:false, message: error.message})        
    }
}

//-----------------------------------------------Deleted Review---------------------------------------
const deleteReview = async function (req, res){
    try{
        let bookId = req.params.bookId;
        let reviewId = req.params.reviewId;

        // validation of bookId and reviewId
        if(!isValidId(bookId) || !isValidId(reviewId)){
            return res
                .status(400)
                .send({status:false, message:"Enter valid bookId or reviewId"})
        }

        //updating isDeleted key as true
        const bookReview = await reviewModel.findOneAndUpdate({_id:reviewId, bookId:bookId, isDeleted: false},{$set:{isDeleted: true}})
        if(!bookReview){
            return res
                .status(404)
                .send({status:false, message:"Review not found or is not for the same book as given in url"})
        }

        //updating the book document by decreasing the number of review
        const book = await bookModel.findOneAndUpdate({_id: bookId},{$inc:{reviews: -1}})
        if(!book){
            return res
                .status(404)
                .send({status:false, message:"Book not found"})
        }
        return res
            .status(200)
            .send({status:true, message:"Review deleted Successfully"})

    }
    catch(error){
        return res
            .status(500)
            .send({status:false, message: error.message})        
    }
}
module.exports = {createReview, updateReview, deleteReview}