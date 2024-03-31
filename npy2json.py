import os
import json

import numpy as np

data_dir = os.path.join(
    os.path.expanduser("~"), "Documents", "video2motion", "results3d"
)

for file in os.listdir(data_dir):

    if not file.endswith(".npy"):
        continue

    file_path = os.path.join(data_dir, file)
    data = np.load(file_path, allow_pickle=True)

    print(data)

    break
