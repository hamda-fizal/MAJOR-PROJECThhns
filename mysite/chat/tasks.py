# from mysite.celeryapp import app
import dramatiq
import torch
from transformers import BertTokenizer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

model = torch.load(
    "model/toxic.pt")
model.to('cpu')
model.eval()
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')


@dramatiq.actor
def detect(text, channel):
    print(text)
    channel_layer = get_channel_layer()
    result = ""
    try:

        input_ids = torch.tensor(tokenizer.encode(
            text, add_special_tokens=True, max_length=512, truncation=True)).unsqueeze(0)  # Batch size 1
        with torch.no_grad():
            output = model(input_ids)
            logits = output[0]
            _, preds = torch.max(logits, 1)
            result = {"success": True, "toxic": bool(preds.numpy()[0])}
    except Exception as e:
        print(e)
        result = {"success": False}
    async_to_sync(channel_layer.group_send)(
        channel, {"type": "chat_message", "message": text, "result": result})
