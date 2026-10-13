exports.chatBot = async (req, res) => {
  console.log("ChatBot API Called");
  console.log(req.body);

  const { message } = req.body;

  res.json({
    reply: `You asked: ${message}`,
  });
};