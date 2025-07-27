import pickle

with open("model_training/models/scaler.pkl",'rb') as file:
    scaler = pickle.load(file)
with open("model_training/models/regression.pkl",'rb') as file:
    regression = pickle.load(file)

def predict_sleep_debt(**kwargs):
    scaled_data = scaler.transform([[kwargs['eye_redness'],kwargs['dark_circles'],kwargs['yawn_count']]])
    sleep_debt = regression.predict(scaled_data)
    
    return round(sleep_debt[0])