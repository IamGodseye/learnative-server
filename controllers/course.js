import AWS from "aws-sdk";
import { nanoid } from "nanoid";
import Course from "../models/course";
import slugify from "slugify";
import { readFileSync } from "fs";
import User from "../models/user";
import Completed from "../models/completed";
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_ACCESS_REGION,
  apiVersion: process.env.AWS_ACCESS_API_VERSION,
  AWS_SDK_LOAD_CONFIG: 1,
};

const S3 = new AWS.S3(awsConfig);

export const uploadImage = async (req, res) => {
  //   console.log(req.body);
  try {
    const { image } = req.body;
    if (!image) return res.status(400).send("No image");
    const base64Data = new Buffer.from(
      image.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );
    const type = image.split(";")[0].split("/")[1];
    const params = {
      Bucket: "onlinemarketplacebucket",
      Key: `${nanoid()}.${type}`,
      Body: base64Data,
      ACL: "public-read",
      ContentEncoding: "base64",
      ContentType: `image/${type}`,
    };
    S3.upload(params, (err, data) => {
      if (err) {
        console.log(err);
        return res.sendStatus(400);
      }
      console.log(data);
      res.send(data);
    });
  } catch (err) {
    console.log(err);
  }
};

export const removeImage = async (req, res) => {
  try {
    const { image } = req.body;
    const params = {
      Bucket: image.Bucket,
      Key: image.Key,
    };
    S3.deleteObject(params, (err, data) => {
      if (err) {
        console.log(err);
        return res.sendStatus(400);
      }

      res.send({ ok: true });
    });
  } catch (err) {
    console.log(err);
  }
};

export const create = async (req, res) => {
  console.log("create Course", req.body);
  try {
    const alreadyExsist = await Course.findOne({
      slug: slugify(req.body.name.toLowerCase()),
    });
    if (alreadyExsist) {
      return res.status(400).send("Title is taken");
    }
    const course = await new Course({
      slug: slugify(req.body.name),
      instructor: req.user._id,
      ...req.body,
    }).save();

    res.json(course);
  } catch (err) {
    console.log(err);
    return res.status(400).send("Course Create failed. Try again...");
  }
};

export const read = async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug })
      .populate("instructor", "_id name")
      .exec();
    console.log(course);
    res.json(course);
  } catch (err) {
    console.log(err);
  }
};

export const uploadVideo = async (req, res) => {
  try {
    // console.log("req.user._id", req.user._id);
    // console.log("req.params.instructorId", req.params.instructorId);

    if (req.user._id != req.params.instructorId) {
      return res.status(400).send("Unauthorised");
    }
    const { video } = req.files;
    console.log(video);

    if (!video) return res.status(400).send("No video");
    //     const base64Data = new Buffer.from(
    //       image.replace(/^data:image\/\w+;base64,/, ""),
    //       "base64"
    //     );
    //     const type = image.split(";")[0].split("/")[1];

    const params = {
      Bucket: "onlinemarketplacebucket",
      //type: video/mp4
      Key: `${nanoid()}.${video.type.split("/")[1]}`,
      Body: readFileSync(video.path),
      ACL: "public-read",

      ContentType: video.type,
    };

    S3.upload(params, (err, data) => {
      if (err) {
        console.log(err);
        return res.sendStatus(400);
      }
      console.log(data);
      res.send(data);
    });
  } catch (err) {
    console.log(err);
  }
};

export const removeVideo = async (req, res) => {
  try {
    if (req.user._id != req.params.instructorId) {
      return res.status(400).send("Unauthorised");
    }
    const { Bucket, Key } = req.body;
    // console.log(video);

    //if (!video) return res.status(400).send("No video");
    //     const base64Data = new Buffer.from(
    //       image.replace(/^data:image\/\w+;base64,/, ""),
    //       "base64"
    //     );
    //     const type = image.split(";")[0].split("/")[1];

    const params = {
      Bucket: Bucket,
      //type: video/mp4
      Key: Key,
    };

    S3.deleteObject(params, (err, data) => {
      if (err) {
        console.log(err);
        return res.sendStatus(400);
      }
      console.log(data);
      res.send({ ok: true });
    });
  } catch (err) {
    console.log(err);
  }
};

export const addLesson = async (req, res) => {
  try {
    const { slug, instructorId } = req.params;
    const { title, content, video, youtubeLink } = req.body;
    if (req.user._id != req.params.instructorId) {
      return res.status(400).send("Unauthorised");
    }
    console.log(video, youtubeLink);
    if (youtubeLink !== "") {
      console.log("YT");
      const video1 = { Location: youtubeLink };
      const updated = await Course.findOneAndUpdate(
        { slug },
        {
          $push: {
            lessons: { title, content, video: video1, slug: slugify(title) },
          },
        },
        { new: true }
      )
        .populate("instructor", "_id name")
        .exec();

      res.json(updated);
    } else if (video) {
      console.log("Video");
      const updated = await Course.findOneAndUpdate(
        { slug },
        {
          $push: { lessons: { title, content, video, slug: slugify(title) } },
        },
        { new: true }
      )
        .populate("instructor", "_id name")
        .exec();

      res.json(updated);
    }
  } catch (err) {
    console.log(err);
    return res.status(400).send("Add lesson failed");
  }
};

export const update = async (req, res) => {
  try {
    const { slug } = req.params;
    const course = await Course.findOne({ slug }).exec();
    console.log("course found =>", course);
    if (req.user._id != course.instructor) {
      return res.status(400).send("Unauthorized");
    }

    const updated = await Course.findOneAndUpdate({ slug }, req.body, {
      new: true,
    }).exec();

    res.json(updated);
  } catch (err) {
    console.log(err);
    return res.status(400).send(err.message);
  }
};

export const removeLesson = async (req, res) => {
  const { slug, lessonId } = req.params;
  const course = await Course.findOne({ slug }).exec();
  console.log("course found =>", course);
  if (req.user._id != course.instructor) {
    return res.status(400).send("Unauthorized");
  }
  const deletedcourse = await Course.findByIdAndUpdate(course._id, {
    $pull: { lessons: { _id: lessonId } },
  }).exec();
  res.json({ ok: true });
};

export const updateLesson = async (req, res) => {
  try {
    const { slug } = req.params;
    const { _id, title, content, video, free_preview } = req.body;
    const course = await Course.findOne({ slug }).select("instructor").exec();
    if (course.instructor._id != req.user._id) {
      return res.status(400).send("Unauthorized");
    }

    const updated = await Course.updateOne(
      { "lessons._id": _id },
      {
        $set: {
          "lessons.$.title": title,
          "lessons.$.content": content,
          "lessons.$.video": video,
          "lessons.$.free_preview": free_preview,
        },
      },
      { new: true }
    ).exec();

    console.log("updated", updated);
    res.json({ ok: true });
  } catch (err) {
    console.log(err);
    return res.status(400).send("Update lesson failed");
  }
};

export const publishCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    // find post
    const courseFound = await Course.findById(courseId)
      .select("instructor")
      .exec();
    // is owner?
    if (req.user._id != courseFound.instructor._id) {
      return res.status(400).send("Unauthorized");
    }

    let course = await Course.findByIdAndUpdate(
      courseId,
      { published: true },
      { new: true }
    ).exec();
    // console.log("course published", course);
    // return;
    res.json(course);
  } catch (err) {
    console.log(err);
    return res.status(400).send("Publish failed");
  }
};

export const unpublishCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId).select("instructor").exec();
    if (course.instructor._id != req.user._id) {
      return res.status(400).send("Unauthorized");
    }
    const updated = await Course.findByIdAndUpdate(
      courseId,
      {
        published: false,
      },
      { new: true }
    ).exec();
    res.json(updated);
  } catch (err) {
    console.log(err);
    return res.status(400).send("Unublish failed");
  }
};

export const courses = async (req, res) => {
  const all = await Course.find({ published: true })
    .limit(11)
    .populate("instructor", "_id name")
    .populate("categories", "_id name")
    .exec();
  res.json(all);
};

export const checkEnrollment = async (req, res) => {
  const { courseId } = req.params;
  const user = await User.findById(req.user._id).exec();
  let ids = [];
  let length = user.courses && user.courses.length;
  for (let i = 0; i < length; i++) {
    ids.push(user.courses[i].toString());
  }

  res.json({
    status: ids.includes(courseId),
    course: await Course.findById(courseId).exec(),
  });
};

export const freeEnrollment = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId).exec();
    if (course.paid) return;
    const result = await User.findByIdAndUpdate(
      req.user._id,
      {
        $addToSet: { courses: course._id },
      },
      { new: true }
    ).exec();
    res.json({
      message: "Congratulations! You have successfully enrolled",
      course: course,
    });
  } catch (err) {
    console.log("Free enrollment error", err);
    return res.status(400).send("Enrollment create failed");
  }
};

export const paidEnrollment = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId)
      .populate("instructor")
      .exec();
    if (!course.paid) return;
    //platform fee => 17% + 3% stripe fee
    const fee = (course.price * 20) / 100;
    //instructor fee

    //session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          name: course.name,
          amount: Math.round(course.price.toFixed(2) * 100),
          currency: "inr",
          quantity: 1,
        },
      ],

      //charge and update balance
      payment_intent_data: {
        application_fee_amount: Math.round(fee.toFixed(2) * 100),
        transfer_data: {
          destination: course.instructor.stripe_account_id,
        },
      },

      //send session
      success_url: `${process.env.STRIPE_SUCCESS_URL}/${course._id}`,
      cancel_url: process.env.STRIPE_CANCEL_URL,
    });

    console.log("Session", session);

    await User.findByIdAndUpdate(req.user._id, {
      stripeSession: session,
    }).exec();
    res.send(session.id);
  } catch (err) {
    console.log("paid Enrollment error", err);
    return res.status(400).send("Enrollment create Failed");
  }
};

export const stripeSuccess = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId).exec();
    console.log(req.user);
    const user = await User.findById(req.user._id).exec();
    console.log(user, course);
    // return res.json({ message: "Course mila op" });
    // res.json({ success: true, course: course });
    if (!user.stripeSession.id) return res.sendStatus(400);

    const session = await stripe.checkout.sessions.retrieve(
      user.stripeSession.id
    );
    console.log("STRIPE SUCCESS", session);
    if (session.payment_status === "paid") {
      await User.findByIdAndUpdate(user._id, {
        $addToSet: { courses: course._id },
        $set: { stripeSession: {} },
      }).exec();
      console.log(course);
    }
    res.json({ success: true, course: course });
  } catch (err) {
    console.log("Stripe success error", err);
    res.json({ success: false });
  }
};

export const userCourses = async (req, res) => {
  const user = await User.findById(req.user._id).exec();
  const courses = await Course.find({ _id: { $in: user.courses } })
    .populate("instructor", "_id name")
    .exec();

  res.json(courses);
};

export const markCompleted = async (req, res) => {
  const { courseId, lessonId } = req.body;
  const existing = await Completed.findOne({
    user: req.user._id,
    course: courseId,
  }).exec();

  if (existing) {
    // update
    const updated = await Completed.findOneAndUpdate(
      {
        user: req.user._id,
        course: courseId,
      },
      {
        $addToSet: { lessons: lessonId },
      }
    ).exec();
    res.json({ ok: true });
  } else {
    // create
    const created = await new Completed({
      user: req.user._id,
      course: courseId,
      lessons: lessonId,
    }).save();
    res.json({ ok: true });
  }
};

export const listCompleted = async (req, res) => {
  try {
    const list = await Completed.findOne({
      user: req.user._id,
      course: req.body.courseId,
    }).exec();
    list && res.json(list.lessons);
  } catch (err) {
    console.log(err);
  }
};

export const markIncomplete = async (req, res) => {
  try {
    const { courseId, lessonId } = req.body;

    const updated = await Completed.findOneAndUpdate(
      {
        user: req.user._id,
        course: courseId,
      },
      {
        $pull: { lessons: lessonId },
      }
    ).exec();
    res.json({ ok: true });
  } catch (err) {
    console.log(err);
  }
};
