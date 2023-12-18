const _ = require('lodash');

const dummy = (blogs) => {
    return 1
  }

const totalLikes = (blogs) => {
    const res = blogs.reduce(
        (sum, blog) => sum + blog.likes,
        0,
    )
    return res
  }

const favoriteBlog = (blogs) => {
    const res = blogs.reduce(
        (most,contender) =>
        contender.likes>most.likes ? contender : most
    )
    const blog = {
        title: res.title,
        author: res.author,
        likes: res.likes
    }
    return blog
  }

const mostBlogs = (blogs) => {
    const res = _.entries(_.countBy(blogs.map((blog)=> blog.author)))
    const res2 = res.reduce((most,contender) =>
        contender[1]>most[1] ? contender : most)

    const blog = {
        author: res2[0],
        blogs: res2[1]
    }
    return blog
  }

const mostLikes = (blogs) => {
    const res =[]
    blogs.forEach((blog)=>{
        res.push({
            author: blog.author,
            likes: blog.likes
          })
    })

    let author1 = ""
    let likes1 = 0
    for (let i = 0; i < res.length; i++) {
        let author2 = res[i].author
        let likes2 = res[i].likes
        for (let j = i+1; j < res.length; j++) {
            if(res[j].author === author2){
                likes2 += res[j].likes
            }
          }
        if(likes2> likes1){
            author1 = author2
            likes1 = likes2
        }
      }
      
    const blog = {
        author: author1,
        likes: likes1
    }
    return blog
  }

  
  module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
  }